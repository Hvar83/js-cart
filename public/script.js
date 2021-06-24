document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);
window.addEventListener("load", pageFullyLoaded, false);
  

$.getJSON("./products.json", function (data) {
    loadProductList(data);
});

function theDomHasLoaded(e) {
    // when DOM is fully loaded
}

function pageFullyLoaded(e) {
    // when page is fully loaded
}

function loadProductList(result) {
    let productList = '';
    result.results.forEach(item => {
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
                    <button id="add" class="add-to-chart background-black float-none float-md-end">Add to chart</button>
                </div>
            </div>
            `;
    });

    $('.list-items').append(productList);
}

$(document).ready(function(){
    $('.cart-button').click(function() {
        $('.modal')
            .prop('class', 'modal fade')
        $('.modal').modal('show');
    });

    $(document).on('click', '#add' , function() {
        console.log('porcocane')
        var cart = $('.cart-button');
        var totalProducts = cart.attr('data-itemsnumber');
        var newCartTotal = parseInt(totalProducts) + 1;
        setTimeout(function(){
            cart.addClass('receive-item').attr('data-itemsnumber', newCartTotal);
            setTimeout(function(){
              cart.removeClass('receive-item');
            },200)
        },600)
    })
})