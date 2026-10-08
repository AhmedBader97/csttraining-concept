import { deliveryLabels, type Delivery } from '@/content/courses';

export function DeliveryList({ delivery }: { delivery: Delivery[] }) {
  return (
    <ul className="delivery-list" aria-label="How it's delivered">
      {delivery.map((mode) => (
        <li key={mode} className={`delivery-list__item delivery-list__item--${mode}`}>
          {deliveryLabels[mode]}
        </li>
      ))}
    </ul>
  );
}
