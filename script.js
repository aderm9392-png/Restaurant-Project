
const menuItems = [
  // Pizza
  { id: 1, name: 'Margherita Pizza', price: '$12.99', emoji: '🍕', category: 'pizza', description: 'Fresh mozzarella and basil' },
  { id: 2, name: 'Pepperoni Pizza', price: '$14.99', emoji: '🍕', category: 'pizza', description: 'Classic pepperoni lovers' },
  { id: 3, name: 'Vegetarian Pizza', price: '$13.99', emoji: '🍕', category: 'pizza', description: 'Fresh vegetables' },
  { id: 4, name: 'Meat Lovers Pizza', price: '$16.99', emoji: '🍕', category: 'pizza', description: 'Bacon, sausage, ham' },
  // Burger
  { id: 5, name: 'Classic Burger', price: '$9.99', emoji: '🍔', category: 'burgers', description: 'Cheese and lettuce' },
  { id: 6, name: 'Bacon Burger', price: '$11.99', emoji: '🍔', category: 'burgers', description: 'Crispy bacon included' },
  { id: 7, name: 'Double Patty Burger', price: '$12.99', emoji: '🍔', category: 'burgers', description: 'Two beef patties' },
  { id: 8, name: 'Mushroom Swiss', price: '$10.99', emoji: '🍔', category: 'burgers', description: 'Sautéed mushrooms & swiss' },
  // Drinks
  { id: 9, name: 'Coca Cola', price: '$2.99', emoji: '🥤', category: 'drinks', description: 'Cold refreshment' },
  { id: 10, name: 'Fruit Juice', price: '$3.99', emoji: '🧃', category: 'drinks', description: 'Fresh fruit juice' },
  { id: 11, name: 'Iced Tea', price: '$2.49', emoji: '🍹', category: 'drinks', description: 'Refreshing iced tea' },
  { id: 12, name: 'Milkshake', price: '$4.99', emoji: '🥛', category: 'drinks', description: 'Creamy milkshake' },
  // Desserts
  { id: 13, name: 'Chocolate Cake', price: '$5.99', emoji: '🍰', category: 'desserts', description: 'Rich chocolate cake' },
  { id: 14, name: 'Cheesecake', price: '$6.99', emoji: '🍰', category: 'desserts', description: 'New York style' },
  { id: 15, name: 'Ice Cream', price: '$3.99', emoji: '🍦', category: 'desserts', description: 'Multiple flavors' },
  { id: 16, name: 'Brownie', price: '$4.49', emoji: '🍫', category: 'desserts', description: 'Fudgy brownie' }
];

let cart = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
  renderMenu();
  setupEventListeners();
  loadCartFromLocalStorage();
  updateCartDisplay();
});

function setupEventListeners() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
    });
  });
}

function renderMenu() {
  const menuGrid = document.getElementById('menuGrid');
  menuGrid.innerHTML = '';

  const filteredItems = currentFilter === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === currentFilter);

  filteredItems.forEach(item => {
    const menuCard = document.createElement('div');
    menuCard.className = 'menu-card';
    menuCard.innerHTML = `
      <div class="menu-image">${item.emoji}</div>
      <h3>${item.name}</h3>
      <p class="description">${item.description}</p>
      <div class="menu-footer">
        <span class="price">${item.price}</span>
        <button class="add-btn" onclick="addToCart(${item.id})">Add</button>
      </div>
    `;
    menuGrid.appendChild(menuCard);
  });
}

function filterMenu(category) {
  currentFilter = category;
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderMenu();
}

function addToCart(itemId) {
  const item = menuItems.find(i => i.id === itemId);
  if (!item) return;

  const existingItem = cart.find(i => i.id === itemId);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price.replace('$', '')),
      emoji: item.emoji,
      quantity: 1
    });
  }

  saveCartToLocalStorage();
  updateCartDisplay();
  showToast(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCartToLocalStorage();
  updateCartDisplay();
}

function updateQuantity(itemId, quantity) {
  const item = cart.find(i => i.id === itemId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCartToLocalStorage();
    updateCartDisplay();
  }
}

function updateCartDisplay() {
  const cartContainer = document.getElementById('cartContainer');
  const cartCount = document.getElementById('cartCount');
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = `(${totalItems})`;

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty. Add items from the menu!</p>';
    return;
  }
    //Rendering Cart items
  let cartHTML = '<div class="cart-items">';
  
  cart.forEach(item => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    cartHTML += `
      <div class="cart-item">
        <div class="item-info">
          <h4>${item.emoji} ${item.name}</h4>
          <p>$${item.price.toFixed(2)} each</p>
        </div>
        <div class="item-total">
          <div class="quantity-controls">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
          </div>
          <span>$${itemTotal}</span>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `;
  });

  cartHTML += '</div>';

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  cartHTML += `
    <div class="cart-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (10%):</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total-row">
        <span>Total:</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    </div>

    <button class="checkout-btn" onclick="toggleCheckoutForm()">Proceed to Checkout</button>
    
    <div class="checkout-form" id="checkoutForm">
      <h3>Delivery Details</h3>
      <form onsubmit="placeOrder(event)">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" name="name" required placeholder="John Doe">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="john@example.com">
        </div>
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" required placeholder="(234) 123-4567">
        </div>
        <div class="form-group">
          <label for="address">Delivery Address</label>
          <textarea id="address" name="address" required placeholder="Street, City, State" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="notes">Special Instructions (Optional)</label>
          <textarea id="notes" name="notes" placeholder="Any special requests?" rows="2"></textarea>
        </div>
        <div class="checkout-actions">
          <button type="submit" class="place-order-btn">Place Order</button>
          <button type="button" class="cancel-btn" onclick="toggleCheckoutForm()">Cancel</button>
        </div>
      </form>
    </div>
  `;

  cartContainer.innerHTML = cartHTML;
}

function toggleCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (form) {
    form.classList.toggle('show');
  }
}

function placeOrder(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const notes = document.getElementById('notes').value;

  const orderSummary = cart.map(item => `${item.quantity}x ${item.name}`).join('\n');
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = (subtotal * 1.1).toFixed(2);

  const message = `Order from ${name}:\n\n${orderSummary}\n\nTotal: $${total}\n\nDelivery to: ${address}\nPhone: ${phone}${notes ? `\nNotes: ${notes}` : ''}`;

  const whatsappNumber = '+2349026655774';
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');

  cart = [];
  saveCartToLocalStorage();
  updateCartDisplay();
  toggleCheckoutForm();
  showToast('Order sent successfully! Check WhatsApp for confirmation.');
}

function openGoogleMaps() {
  const restaurantLat = 12.1510710;
  const restaurantLng = 9.1530530;
  const restaurantName = 'Your Restaurant Name';
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(restaurantName)}/@${restaurantLat},${restaurantLng},15z`;
  window.open(mapsUrl, '_blank');
}

function getDirections() {
  const restaurantLat = 12.1510710;
  const restaurantLng = 9.1530530;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurantLat},${restaurantLng}`;
  window.open(directionsUrl, '_blank');
}

function openWhatsApp() {
  const whatsappNumber = '+2349026655774';
  const message = 'Hi! I would like to know more about your restaurant and menu options.';
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

function saveCartToLocalStorage() {
  localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('restaurantCart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      console.error('Error loading cart:', e);
      cart = [];
    }
  }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});