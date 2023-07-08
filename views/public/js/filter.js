$(function(){
   
    let $articles = $('.articles');
    $articles.isotope({
        itemSelector: '.gh-card',
        layoutMode:'fitRows'
    })

    $('.filtration a ').on('click',function(e){
        e.preventDefault();
        var filter = $(this).attr('data-filter');
        $articles.isotope({filter:filter})
    })
})