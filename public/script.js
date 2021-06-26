document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);
window.addEventListener("load", pageFullyLoaded, false);
  

$.getJSON("./products.json", function (data) {
    loadProductList(data);
});

function theDomHasLoaded(e) {
    // when DOM is fully loaded
    let items = localStorage.getItem("cart");
    if (items == null) { items = []; }
    else { 
        items = JSON.parse(items);
     }

    let totalItems = 0;
        items.forEach(item => {
            totalItems += item.quantity;
        })

    if (totalItems > 0) {
        $('#no-items').remove();
    }    
    $('.circle-button').attr('data-itemsnumber', totalItems);
}

function pageFullyLoaded(e) {
    // when page is fully loaded
}

function loadProductList(result) {
    let productList = '';
    result.results.forEach(item => {
        let itemDatatoCart = {'id': item.id, 'name': item.name, 'price': item.price} 
        productList +=
            `
            <div class="row product-item">
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-md-4">
                         <img src="./assets/img/${item.image}" class="product-image" alt="image ${item.name}" />
                        </div>
                        <div class="col-md-8">
                            <h2 class="product-title text-center text-md-start">${item.name}</h2>
                            <p class="description text-center text-md-start">${item.description}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-right">
                    <span class="price text-center text-center text-md-end">${item.price} €</span>
                    <button id="add" class="add-to-chart background-black float-none float-md-end" data-code=${item.id} data-image=${item.image} data-name=${item.name} data-price=${item.price}>Add to chart</button>
                </div>
            </div>
            `;
    });

    $('.list-items').append(productList);
}

/* CLICK EVENTS ON HTML ELEMENTS*/ 

$(document).ready(function(){
    $('.cart-button').click(function() { // click cart button
        $('.modal').prop('class', 'modal fade') // add classes modal and fade on modal
        shoppingCart.init();
        $('.modal').modal('show'); // show modal
    });

    $(document).on('click', '#add' , function() { // click add button (ADD TO CART)
        var cart = $('.cart-button'); 
        var itemInfoCode = $(this).data('code');
        var itemInfoName = $(this).data('name');
        var itemInfoPrice = $(this).data('price'); 
        var itemInfoImage = $(this).data('image'); 
        var item = {
            'code': itemInfoCode,
            'name': itemInfoName,
            'price': itemInfoPrice,
            'image': itemInfoImage
        }
        var totalProducts = cart.attr('data-itemsnumber'); // check attribute totalitems in cart button
        var newCartTotal = parseInt(totalProducts) + 1; // update number of items
        shoppingCart.add(item)
        setTimeout(function(){
            cart.addClass('receive-item').attr('data-itemsnumber', newCartTotal); // add class receive-item (move the element as shake) to cart
            setTimeout(function(){
              cart.removeClass('receive-item'); // remove class after 200ms
            },200)
        },600)
    })

    $(document).on('click', '#delete-product' , function() { // click delete product 
        const cart = $('.cart-button'); 
        const itemInfoCode = $(this).data('code');
        const itemInfoQuantity = $(this).data('quantity');
        const totalProducts = cart.attr('data-itemsnumber'); // check attribute totalitems in cart button
        const newCartTotal = parseInt(totalProducts) - itemInfoQuantity; // update number of items
        shoppingCart.remove(itemInfoCode, $(this));

        setTimeout(function(){
            cart.addClass('receive-item').attr('data-itemsnumber', newCartTotal); // add class receive-item (move the element as shake) to cart
            setTimeout(function(){
              cart.removeClass('receive-item'); // remove class after 200ms
            },200)
        },600)
    })
})

/* CART FUNCTIONALITIES */
var shoppingCart = {
    items : [], // Current items in cart

    save: function () {
        if (shoppingCart.items.length === 0) {
            $('header .cart').prepend('<div id="no-items" class="no-items header-description d-inline-block">No items inside cart</div>');
        } else {
            $('#no-items').remove();
        }

        localStorage.setItem("cart", JSON.stringify(shoppingCart.items));
    },
    
    load: function () {
    $('.modal-body').remove('.cart-list-items');    
    shoppingCart.items = localStorage.getItem("cart");
    if (shoppingCart.items == null) { shoppingCart.items = []; }
    else { 
        shoppingCart.items = JSON.parse(shoppingCart.items);
     }
    },
    
    // NUKE CART!
    nuke: function () {
    if (confirm("Empty cart?")) {
        shoppingCart.items = {};
        localStorage.removeItem("cart");
        shoppingCart.list();
      }
    },

    init : function () {
    // GET HTML ELEMENTS
    $('.modal-body').remove('.cart-list-items');
    shoppingCart.cartItems = localStorage.getItem("cart");
    
    
    // LOAD CART FROM PREVIOUS SESSION
    shoppingCart.load();
    
    // LIST CURRENT CART ITEMS
    shoppingCart.list();
    },

    list : function () {
    $('.cart-list-items').remove();
    let empty = true;
    if (shoppingCart.items.length !== 0) {
        empty = false;
    }

    // CART IS EMPTY
    if (empty) {
        $('.modal-body').append('<span class="description d-block text-center">Cart is empty</span>');
    }
    
    // CART IS NOT EMPTY - LIST ITEMS
    else {
        totalQuantity = 0, total = 0, subtotal = 0;
        let cartList = 
        `
        <div class="container fluid cart-list-items">
        `;
        shoppingCart.items.forEach(cartProduct => {
            subtotal = cartProduct.quantity * cartProduct.price;
            cartList +=
            `
            <div class="row cart-item border-bottom-gray">
                <div class="col-md-1 text-center">
                    <img src="./assets/img/${cartProduct.image}" alt="image" />
                </div>
                <div class="col-md-4 text-center">
                    ${cartProduct.name}
                </div>
                <div class="col-md-4 text-center">
                    ${cartProduct.quantity}
                </div>
                <div class="col-md-2 text-center">
                    ${subtotal} €
                </div>
                <div class="col-md-1 text-center">
                    <div id="delete-product" class="circle-button background-white border-white" data-code="${cartProduct.code}" data-quantity=${cartProduct.quantity}>
                        <span class="oi oi-trash color-red lh35 delete-product" alt="delete product" title="delete product"></span>
                    </div>
                </div>
            </div>
            `;    
       
            totalQuantity += cartProduct.quantity;
            total += subtotal;
        })

        $('.cart-button').data('data-itemsnumber', totalQuantity);
        cartList += `
        <div class="row total">
            <div class="col-md-6 offset-md-6 text-right background-gray mt20">
                <div class="row mb10">
                    <div class="col-md-8 col-sm-12 text-md-start text-center text-uppercase">Items:</div>
                    <div class="col-md-4 col-sm-12 text-md-end text-center">${totalQuantity}</div>
                </div>
                <div class="row mb20">
                    <div class="col-md-8 col-sm-12 text-md-start text-center text-uppercase">Total:</div>
                    <div class="col-md-4 col-sm-12 text-md-end text-center">${total} €</div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="mt10 col-md-3 offset-md-9 text-md-end text-center">
                <button id="checkout" class="checkout background-black">CHECKOUT</button>
            </div>
        </div>
        `;
        $('.modal-body').append(cartList);
    }
    },

    add : function (product) {
        let found = false;
        for (var i in shoppingCart.items) {
            if (shoppingCart.items[i].code === product.code) {
                shoppingCart.items[i].quantity++;
                found = true;
            } else {
                found = false;
            }
        }
        
        if(!found) {shoppingCart.items.push({...product, 'quantity': 1})} 

        shoppingCart.save();
    },

    // CHANGE QUANTITY
    change : function () {
        if (this.value == 0) {
            delete shoppingCart.items[this.dataset.id];
        } else {
            shoppingCart.items[this.dataset.id] = this.value;
        }
        shoppingCart.save();
        shoppingCart.list();
    },
    
    // REMOVE ITEM FROM CART
    remove : function (id, el) {
        shoppingCart.items = shoppingCart.items.filter(item => item.code !== id);
        shoppingCart.loading(el, 'delete');
        setTimeout(function(){
            shoppingCart.save();
            shoppingCart.list();
        },500)
    },

    loading : function(el, action) {
        el.parent().parent().addClass('opacity03');
        el.parent().parent().prepend('<div id="loader" class="loader"</div>');
    },
    
    // CHECKOUT
    checkout : function () {
    alert("TO DO");
    }
};