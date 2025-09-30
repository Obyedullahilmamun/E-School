// Mobile menu toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  const mobileMenu = document.getElementById("mobile-menu");
  const menuContainer = document.querySelector(".menu-container");

  if (mobileMenu) {
    mobileMenu.addEventListener("click", function () {
      menuContainer.classList.toggle("active");
      mobileMenu.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking on a menu item
  const menuItems = document.querySelectorAll(".menu-container .item a");
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuContainer.classList.remove("active");
      mobileMenu.classList.remove("active");
    });
  });

  // Course purchase functionality (for course.html)
  const cards = document.querySelectorAll(".card");
  const cartItems = [];
  let totalCost = 0;

  for (let i = 0; i < cards.length; i++) {
    const currentCard = cards[i];
    const btn = currentCard.querySelector("button");

    if (!btn) continue;

    const price_text = currentCard.querySelector("strong").textContent;
    const img = currentCard.querySelector("img").src;
    const title = currentCard.querySelector("h2").textContent;

    const price_string = price_text.split(" ")[1];
    const price = parseFloat(price_string);

    btn.addEventListener("click", function () {
      const item = {
        title,
        img,
        price,
      };

      const isFoundIdx = cartItems.findIndex((singleCartItem) => {
        return singleCartItem.title == title;
      });

      console.log(isFoundIdx < 0 ? "NOT FOUND" : "FOUND");

      if (isFoundIdx < 0) {
        item.quantity = 1;
        cartItems.push(item);
      } else {
        cartItems[isFoundIdx].quantity++;
      }

      totalCost = totalCost + price;
      generateCartItems();
    });
  }

  function generateCartItems() {
    const pageRight = document.querySelector(".page-right");
    if (!pageRight) return;

    pageRight.innerHTML = "";

    const totalPriceElement = `
            <section class="cart-summary">
                <strong>Sub-Total: ${totalCost} TK</strong>
            </section>
        `;
    pageRight.innerHTML += totalPriceElement;

    for (let i = 0; i < cartItems.length; i++) {
      const singleItem = cartItems[i];
      const singleCart = `
                <section class="cart-item">
                    <section class="cart-item-header">
                        <figure class="cart-figure">
                            <img class="cart-img" src="${
                              singleItem.img
                            }" alt="${singleItem.title}" />
                        </figure>
                        <article>
                            <h3>${singleItem.title}</h3>
                        </article>
                    </section>
                    <section class="cart-item-details">
                        <div class="detail-group">
                            <p>Unit Price</p>
                            <p><strong>${singleItem.price} TK</strong></p>
                        </div>
                        <div class="detail-group">
                            <p>Quantity</p>
                            <p><strong>${singleItem.quantity}</strong></p>
                        </div>
                    </section>
                    <article class="cart-item-total">
                        <p><strong>Total: ${(
                          singleItem.price * singleItem.quantity
                        ).toFixed(2)} TK</strong></p>
                    </article>
                </section>
            `;
      pageRight.innerHTML = pageRight.innerHTML + singleCart;
    }
  }
});

// Course page cart functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart
  let cart = JSON.parse(localStorage.getItem("eschool-cart")) || [];
  let totalCost = 0;

  // Update cart display
  function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.querySelector(".cart-count");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const checkoutBtn = document.querySelector(".checkout-btn");

    if (!cartItemsContainer) return;

    // Calculate total
    totalCost = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) {
      cartCount.textContent = `${totalItems} ${
        totalItems === 1 ? "item" : "items"
      }`;
    }

    // Update subtotal
    if (cartSubtotal) {
      cartSubtotal.textContent = `${totalCost} TK`;
    }

    // Update checkout button
    if (checkoutBtn) {
      checkoutBtn.disabled = cart.length === 0;
    }

    // Update cart items
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p>Add some courses to get started!</p>
                </div>
            `;
    } else {
      cartItemsContainer.innerHTML = cart
        .map(
          (item) => `
                <div class="cart-item" data-title="${item.title}">
                    <div class="cart-item-header">
                        <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                        <h4 class="cart-item-title">${item.title}</h4>
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-price">${item.price} TK</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" data-title="${item.title}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase" data-title="${item.title}">+</button>
                        </div>
                        <button class="remove-btn" data-title="${item.title}">Remove</button>
                    </div>
                </div>
            `
        )
        .join("");

      // Add event listeners to quantity buttons
      document.querySelectorAll(".quantity-btn.decrease").forEach((btn) => {
        btn.addEventListener("click", function () {
          const title = this.getAttribute("data-title");
          updateQuantity(title, -1);
        });
      });

      document.querySelectorAll(".quantity-btn.increase").forEach((btn) => {
        btn.addEventListener("click", function () {
          const title = this.getAttribute("data-title");
          updateQuantity(title, 1);
        });
      });

      document.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const title = this.getAttribute("data-title");
          removeFromCart(title);
        });
      });
    }

    // Save to localStorage
    localStorage.setItem("eschool-cart", JSON.stringify(cart));
  }

  // Add to cart function
  function addToCart(title, price, img) {
    const existingItem = cart.find((item) => item.title === title);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        title,
        price,
        img,
        quantity: 1,
      });
    }

    updateCartDisplay();

    // Show success message
    showNotification(`${title} added to cart!`);
  }

  // Update quantity function
  function updateQuantity(title, change) {
    const item = cart.find((item) => item.title === title);

    if (item) {
      item.quantity += change;

      if (item.quantity <= 0) {
        removeFromCart(title);
      } else {
        updateCartDisplay();
      }
    }
  }

  // Remove from cart function
  function removeFromCart(title) {
    cart = cart.filter((item) => item.title !== title);
    updateCartDisplay();
    showNotification(`${title} removed from cart`);
  }

  // Show notification
  function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector(".cart-notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #21B573;
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Add event listeners to "Add to Cart" buttons
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const title = this.getAttribute("data-title");
      const price = parseFloat(this.getAttribute("data-price"));
      const img = this.getAttribute("data-img");

      addToCart(title, price, img);
    });
  });

  // Checkout button event listener
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (cart.length > 0) {
        alert(`Thank you for your purchase! Total: ${totalCost} TK`);
        cart = [];
        updateCartDisplay();
      }
    });
  }

  // Initialize cart display
  updateCartDisplay();
});

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
