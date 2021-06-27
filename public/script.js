document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);
window.addEventListener("load", pageFullyLoaded, false);
  
// load info from products.json
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

/*** EVENTS ON HTML ELEMENTS ***/ 
$(document).ready(function(){
    // click cart button in header
    $('.cart-button').click(function() {
        $('.modal').prop('class', 'modal fade') // add classes modal and fade on modal
        shoppingCart.init();
        $('.modal').modal('show'); // show modal
    });

    // click add button (ADD TO CART)
    $(document).on('click', '#add' , function() {
        const cart = $('.cart-button'); 
        const itemInfoCode = $(this).data('code');
        const itemInfoName = $(this).data('name');
        const itemInfoPrice = $(this).data('price'); 
        const itemInfoImage = $(this).data('image'); 
        const item = {
            'code': itemInfoCode,
            'name': itemInfoName,
            'price': itemInfoPrice,
            'image': itemInfoImage
        }
        const totalProducts = cart.attr('data-itemsnumber'); // check attribute totalitems in cart button
        const newCartTotal = parseInt(totalProducts) + 1; // update number of items
        shoppingCart.add(item)
        setTimeout(function(){
            cart.addClass('receive-item').attr('data-itemsnumber', newCartTotal); // add class receive-item (move the element as shake) to cart
            setTimeout(function(){
              cart.removeClass('receive-item'); // remove class after 200ms
            },200)
        },600)
    })

    // click delete product 
    $(document).on('click', '#delete-product' , function() {
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

    $(document).on('change', '#modify-quantity' , function() {
        const value = parseInt($(this).val());
        const itemInfoCode = $(this).data('code');
        shoppingCart.change(itemInfoCode, $(this), value);
    })

    // click delete empty cart button
    $(document).on('click', '#delete-all' , function() { // click delete product 
        const cart = $('.cart-button'); 
        shoppingCart.empty($(this));

        setTimeout(function(){
            cart.addClass('receive-item').attr('data-itemsnumber', 0); // add class receive-item (move the element as shake) to cart
            setTimeout(function(){
              cart.removeClass('receive-item'); // remove class after 200ms
            },200)
        },600)
    })
})

/*** CART FUNCTIONALITIES ***/
var shoppingCart = {
    items : [], // Current items in cart

    /*FUNCTION SAVE CART ITEMS */
    save: function () {
        if (shoppingCart.items.length === 0) {
            $('header .cart').prepend('<div id="no-items" class="no-items header-description d-none d-sm-none d-md-inline-block">No items inside cart</div>');
        } else {
            $('#no-items').remove();
        }

        localStorage.setItem("cart", JSON.stringify(shoppingCart.items)); // save in localStorage
    },
    
    /* FUNCTION LOAD CART ITEMS */
    load: function () {
    $('.modal-body').remove('.cart-list-items');    
    shoppingCart.items = localStorage.getItem("cart");
    if (shoppingCart.items == null) { shoppingCart.items = []; } // if localStorage doesn't have any item "cart", items are empty array
    else { 
        shoppingCart.items = JSON.parse(shoppingCart.items);
     }
    },
    
    /* FUNCTION EMPTY CART */
    empty: function (el) {
        shoppingCart.items = []; // array of items empty
        shoppingCart.loading(el); // calling function loading effect
        setTimeout(() =>{
            shoppingCart.save();
            shoppingCart.list();
            shoppingCart.disableCheckout(false);
        },500)
    },

    /* FUNCTION INIT CART */
    init : function () {
        $('.modal-body').remove('.cart-list-items');
        shoppingCart.cartItems = localStorage.getItem("cart");
        shoppingCart.load(); // load items
        shoppingCart.list(); // create html list of items
    },

    /* FUNCTION LIST CART ITEMS */
    list : function () {
        // remove html messages
        $('.cart-list-items').remove();
        $('.cart-empty').remove();
        $('.delete-all').remove();

        // check if cart is empty
        let empty = true;
        if (shoppingCart.items.length !== 0) {
            empty = false;
        }

        if (empty) {
            $('.modal-body').append('<span class="cart-empty description d-block text-center">Cart is empty</span>');
        }
        
        // if it's not empty add html elements
        else {
            totalQuantity = 0, total = 0, subtotal = 0;
            let selectOptionsQuantity = ``;
            let cartList = 
            `
            <div class="container fluid cart-list-items">
            `;
            shoppingCart.items.forEach(cartProduct => {
                subtotal = cartProduct.quantity * cartProduct.price;
                selectOptionsQuantity =
                `<select id="modify-quantity" class="" data-code=${cartProduct.code}>`;
                for(let i = 1; i <= 20; i++) {
                    if (i === cartProduct.quantity) {
                        selectOptionsQuantity += '<option value="' + i +'" selected="selected">' + i +'</option>';  
                    } else {
                        selectOptionsQuantity += '<option value="' + i +'">' + i +'</option>';  
                    }
                }
                selectOptionsQuantity += `</select>`;
                cartList +=
                `
                <div class="row cart-item border-bottom-gray">
                    <div class="col-md-1 col-sm-12 text-center ptb-sm-2">
                        <img src="./assets/img/${cartProduct.image}" alt="image" />
                    </div>
                    <div class="col-md-4 col-sm-12 text-center ptb-sm-2">
                        ${cartProduct.name}
                    </div>
                    <div class="col-md-2 col-sm-12 text-md-end text-center ptb-sm-2">
                    ${selectOptionsQuantity}
                    </div>
                    <div class="col-md-3 col-sm-12 text-md-end text-center ptb-sm-2 position-relative">
                        ${subtotal} €
                        <span class="unit-price">Unit price: ${cartProduct.price} €</span>
                    </div>
                    <div class="col-md-2 col-sm-12 buttons-cart d-flex text-center align-items-center justify-content-end ptb-sm-2">
                        <div id="delete-product" class="remove-item" data-code="${cartProduct.code}" data-quantity=${cartProduct.quantity}>
                            <span class="oi oi-trash"></span>
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
                <div class="col-md-6 col-sm-12 offset-md-6 text-right background-gray mt20">
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
                <div class="mt10 col-md-3 col-sm-12 offset-md-9 text-md-end text-center">
                    <button id="checkout" class="checkout background-black">CHECKOUT</button>
                </div>
            </div>
            `;

            $('.modal-body').append(cartList);
            if (total > 0) { // check if cart has elements and add delete all button
                $('.cart-list-items').prepend('<div class="d-flex flex-column align-items-end"><div id="delete-all" class="delete-all"><span class="oi oi-trash"></span>Delete all</div></div>')
            }
        }
    },

    /* FUNCTION ADD ELEMENT TO CART */
    add : function (product) {
        let found = false;
        for (var i in shoppingCart.items) { // loop inside cart items 
            if (shoppingCart.items[i].code === product.code) { // if item to add is there, update the quantity
                shoppingCart.items[i].quantity++;
                found = true;
                break; // if found it, stop loop
            } else {
                found = false; 
            }
        }
        
        if(!found) {shoppingCart.items.push({...product, 'quantity': 1})} // if item doesn't exist in cart, add new line with quantity 1

        shoppingCart.save();
    },

    /* FUNCTION CHANGE QUANTITY ITEM */
    change : function (id, el, value) {
        let totalItems = 0;
        shoppingCart.items.forEach((element, index) => { // checking items 
            if  (element.code === id) {
                shoppingCart.items[index].quantity = value; // update the item with the new quantity
            }
            totalItems += shoppingCart.items[index].quantity;
        });

        $('.circle-button').attr('data-itemsnumber', totalItems);

        timeout = setTimeout(() => {
            shoppingCart.loading(el); // calling function loading effect
            setTimeout(() => {
                shoppingCart.save();
                shoppingCart.list();
                shoppingCart.disableCheckout(false);
            }, 500)
        }, 1000);
    },
    
    /* FUNCTION REMOVE ITEM FROM THE CART */
    remove : function (id, el) {
        shoppingCart.items = shoppingCart.items.filter(item => item.code !== id); // filter array with element with code !== id
        shoppingCart.loading(el); // calling function loading effect
        setTimeout(() =>{
            shoppingCart.save();
            shoppingCart.list();
            shoppingCart.disableCheckout(false);
        },500)
    },

    /* LOADING EFFECT */
    loading : function(el) {
        shoppingCart.disableCheckout(true);
        if (el.hasClass('delete-all')) {
            el.parent().prepend('<div class="mask-loader"><div id="loader" class="loader"</div></div>'); // add mask-load as first-child of parent
        } else {
            el.parent().parent().parent().prepend('<div class="mask-loader"><div id="loader" class="loader"</div></div>');
        }
    },

    disableCheckout: function(status) {
        if (status) {
            $('#checkout').attr("disabled", "disabled");
        } else {
            $('#checkout').removeAttr("disabled", "disabled");
        }
    },
    
    /* CHECKOUT */
    checkout : function() {
        alert("now you have to pay!!");
    }
};