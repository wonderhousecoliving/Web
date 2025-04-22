function loadCalendar(callback) {

    console.log('loading calendar');
    const script = document.createElement('script');
    script.src ='https://d2q3n06xhbi0am.cloudfront.net/calendar.js';
    script.async = true;
    
    script.onload = () => {
        console.log('script loaded');
        if (callback) callback();
    };
    
    script.onerror = (error) => {
        console.error('Error loading script:', error);
    };
    
    document.body.appendChild(script);
}

loadCalendar(()=>{



      window.hostawayCalendarWidget({
            baseUrl: 'https://fideltest.holidayfuture.com/',
            listingId: 74771,
            numberOfMonths: 2, // or 1
            openInNewTab: true, // or false
            font: 'Open Sans',
            rounded: true, // or false
            button: {
              action: 'checkout', // or 'inquiry'
              text: 'Book now',
            },
            clearButtonText: 'Clear dates',
            color: {
              mainColor: '#ff0000',
              frameColor: '#000000',
              textColor: 'green',
            },
          });
});