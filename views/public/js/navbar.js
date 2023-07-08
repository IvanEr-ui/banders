// высота всего окна браузера
const height = window.outerHeight;
// получим текущее значение скрола на странице
window.onscroll = () => {
    if(Math.round(scrollY) > height){
        document.querySelector('.navmenu').style.bottom = '0';
    }
    else{
        if(Math.round(scrollY) < height*1.5){
            document.querySelector('.navmenu').style.bottom = '';
        }
    }
}