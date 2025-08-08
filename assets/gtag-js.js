<!-- Google Tag Manager -->
<script>(function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
            'gtm.start':
                new Date().getTime(), event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src =
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-WGVMHZDV');</script>
<!-- End Google Tag Manager -->

<script>
    window.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            gtag("event", "page_view_over_146s");
        }, 146000);
    });
</script>

{% render 'gtag-signup_event_fire' %}
{% render 'gtag-pifyform_event_fire' %}
{% render 'gtag-simple-cases-track' %}

