class ZCloudteamClock {
    constructor(dom_element_selector) {
        this.clock_root = document.querySelector(dom_element_selector);
        this.clock_hh = this.clock_root.querySelector('.clock__hh');
        this.clock_mm = this.clock_root.querySelector('.clock__mm');

        const self = this;

        this.clock_root.addEventListener('touchstart', (e) => {
            e.preventDefault();
            self.clock_root.classList.toggle('.clock_inverse');
        });

        setInterval(function() {
            self.redraw();
        }, 1000);
    }

    redraw() {
        let time = new Date();
        this.clock_hh.innerHTML = time.getHours().toString();
        this.clock_mm.innerHTML = time.getMinutes().toString();
    }
}