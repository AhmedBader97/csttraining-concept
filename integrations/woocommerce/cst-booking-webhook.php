<?php
/**
 * Plugin Name: CST booking webhook (concept)
 * Description: When a WooCommerce order is paid or put on hold, send it to n8n,
 *              which updates HubSpot and schedules certificate renewal reminders.
 *              Drop into wp-content/mu-plugins/ and set CST_N8N_WEBHOOK_URL in wp-config.php.
 * Author:      Ahmed Bader (concept for CST Training)
 */

defined('ABSPATH') || exit;

add_action('woocommerce_order_status_processing', 'cst_send_booking_to_n8n', 10, 1);
add_action('woocommerce_order_status_on-hold', 'cst_send_booking_to_n8n', 10, 1);

/**
 * Builds the same "booking.created" event the Next.js front end shows in its
 * integration inspector (src/lib/integrations/n8n.ts), and posts it to n8n.
 */
function cst_send_booking_to_n8n(int $order_id): void
{
    if (!defined('CST_N8N_WEBHOOK_URL')) {
        return;
    }

    $order = wc_get_order($order_id);
    if (!$order || $order->get_meta('_cst_sent_to_n8n')) {
        return; // already sent: status changes can fire this more than once
    }

    $places = 0;
    $lines = [];
    foreach ($order->get_items() as $item) {
        $places += (int) $item->get_quantity();
        $lines[] = [
            'product_id' => $item->get_product_id(),
            'name'       => $item->get_name(),
            'places'     => (int) $item->get_quantity(),
            'delivery'   => (string) $item->get_meta('Delivery'),
            'venue'      => (string) $item->get_meta('Venue'),
            'start_date' => (string) $item->get_meta('Start date'),
        ];
    }

    $event = [
        'event'       => 'booking.created',
        'occurred_at' => gmdate('c'),
        'order_id'    => $order->get_id(),
        'customer'    => [
            'email'           => $order->get_billing_email(),
            'first_name'      => $order->get_billing_first_name(),
            'last_name'       => $order->get_billing_last_name(),
            'phone'           => $order->get_billing_phone(),
            'company'         => $order->get_billing_company(),
            'citb_registered' => $order->get_meta('_citb_registered_employer') === 'yes',
        ],
        'totals'       => [
            'places' => $places,
            'net'    => wc_format_decimal($order->get_subtotal(), 2),
            'vat'    => wc_format_decimal($order->get_total_tax(), 2),
            'gross'  => wc_format_decimal($order->get_total(), 2),
        ],
        'bulk_booking' => $places >= 5,
        'lines'        => $lines,
    ];

    $response = wp_remote_post(CST_N8N_WEBHOOK_URL, [
        'headers' => [
            'Content-Type' => 'application/json',
            // n8n's Header Auth credential checks this shared secret.
            'X-CST-Signature' => hash_hmac('sha256', wp_json_encode($event), defined('CST_N8N_SECRET') ? CST_N8N_SECRET : ''),
        ],
        'body'    => wp_json_encode($event),
        'timeout' => 10,
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) >= 300) {
        // Leave a note on the order so the team can see it needs a retry.
        $order->add_order_note('Could not send this booking to n8n; it will be retried on the next status change.');
        return;
    }

    $order->update_meta_data('_cst_sent_to_n8n', gmdate('c'));
    $order->save();
}
