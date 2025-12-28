// 1. Show logo after spinner finishes
setTimeout(() => {
    document.getElementById('spinner').style.display = 'none';
    let logo = document.getElementById('logo');
    logo.style.display = 'block';

    setTimeout(() => {
        logo.style.opacity = 1;

        // 2. Logo আসার 1 second পর website text আসবে
        setTimeout(() => {
            document.getElementById('siteText').style.display = 'block';

            // 3. siteText আসার 1 second পর button আসবে
            setTimeout(() => {
                let btn = document.getElementById('welcomeBtn');
                btn.style.display = 'flex';
                setTimeout(() => { btn.style.opacity = 1; }, 50);
            }, 1000);

        }, 1000);

    }, 50);
}, 2000);

// 4. Button click -> show spinner for 2 seconds
document.getElementById('welcomeBtn').addEventListener('click', function(){
    let btnSpinner = document.getElementById('btnSpinner');
    btnSpinner.style.display = 'inline-block';

    setTimeout(() => {
        btnSpinner.style.display = 'none';
    }, 2000);
});