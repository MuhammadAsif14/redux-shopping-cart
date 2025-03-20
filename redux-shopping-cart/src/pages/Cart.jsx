import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "../redux/cartSlice";

const Cart = () => {
    const cartItems = useSelector((state) => state.cart.cartItems);
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (!email) {
            setMessage("❌ Please enter an email!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/send-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, cartItems }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("✅ Order sent successfully!");
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (error) {
            setMessage("❌ Failed to send order. Try again.");
        }
    };

    return (
        <div className="cart-container">
            <h1>🛍️ Your Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <ul>
                        {cartItems.map((item) => (
                            <li key={item.id} className="cart-item">
                                <img src={item.image} alt={item.title} className="cart-img" />
                                <div className="cart-details">
                                    <h3>{item.title}</h3>
                                    <p>${item.price.toFixed(2)}</p>
                                    <div className="cart-controls">
                                        <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>+</button>
                                    </div>
                                    <button className="remove-btn" onClick={() => dispatch(removeFromCart(item.id))}>Remove</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h2>Total: ${totalPrice.toFixed(2)}</h2>
                    
                    {/* ✅ Email Input */}
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="email-input"
                    />

                    {/* 🛒 Checkout Button */}
                    <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>

                    {/* 📝 Message Display */}
                    {message && <p className="checkout-message">{message}</p>}
                </>
            )}
        </div>
    );
};

export default Cart;
