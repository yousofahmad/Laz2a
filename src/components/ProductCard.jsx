import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { useCart } from '../CartContext';
import { BASE_PRICE } from '../utils/promotions';
import './ProductCard.css';

/**
 * ProductCard — dark-mode sticker card with neon accent hover effect.
 * Props: sticker { id, name, category, image, description }
 */
export default function ProductCard({ sticker }) {
  const { addItem, items } = useCart();

  const inCart = items.find((i) => i.id === sticker.id);

  return (
    <div className="product-card">
      <div className="product-card__image-wrap">
        <img
          src={sticker.image}
          alt={sticker.name}
          className="product-card__image"
          loading="lazy"
        />
        <span className="product-card__category-badge">
          <Badge bg="dark" className="category-badge">
            {sticker.category}
          </Badge>
        </span>
      </div>

      <div className="product-card__body">
        <h5 className="product-card__title">{sticker.name}</h5>
        <p className="product-card__desc">{sticker.description}</p>

        <div className="product-card__footer">
          <span className="product-card__price">{BASE_PRICE} EGP</span>
          <Button
            variant={inCart ? 'outline-warning' : 'warning'}
            size="sm"
            className="add-btn"
            onClick={() => addItem(sticker)}
          >
            {inCart ? `✓ In Cart (${inCart.quantity})` : '+ Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}
