$(function () {

    let $articles = $('.articles');
    $articles.isotope({
        itemSelector: '.gh-card',
        layoutMode: 'fitRows'
    })
    let $listFilter = document.querySelectorAll('.filtration a')
    console.log($listFilter)
    $('.filtration a ').on('click', function (e) {
        $listFilter.forEach($FilterItem => $FilterItem.classList.remove('active'))
        e.target.classList.add("active");

        e.preventDefault();
        var filter = $(this).attr('data-filter');
        $articles.isotope({ filter: filter })
    })
})