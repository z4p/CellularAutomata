class ZCloudteamClock {
    constructor(dom_element_selector) {
        this.clock_root = document.querySelector(dom_element_selector);
        this.clock_hh = this.clock_root.querySelector('.clock__hh');
        this.clock_mm = this.clock_root.querySelector('.clock__mm');

        const self = this;

        this.clock_root.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleFullscreen();
        });

        this.clock_root.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleFullscreen();
        });

        setInterval(function() {
            self.redraw();
        }, 1000);
    }

    redraw() {
        let time = new Date();
        let hours = time.getHours();
        let minutes = time.getMinutes();
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        this.clock_hh.innerHTML = hours.toString();
        this.clock_mm.innerHTML = minutes.toString();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}