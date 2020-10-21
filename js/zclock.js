class ZCloudteamClock {
    constructor(dom_element_selector) {
        this.clock_root = document.querySelector(dom_element_selector);
        this.clock_hh = this.clock_root.querySelector('.clock__hh');
        this.clock_mm = this.clock_root.querySelector('.clock__mm');
        this.date = this.clock_root.querySelector('.date');
        this.styles = [
            {background: '#000', text: '#FFF'},
            {background: '#000', text: '#888'},
            {background: '#FFF', text: '#000'},
        ];
        this.toolbar = {
            btnFullScreen: document.querySelector('#btnToggleFullScreen'),
            btnConfig: document.querySelector('#btnConfig'),
        };

        this.style_index = 0;

        const self = this;

        this.toolbar.btnFullScreen.addEventListener('touchend', ZCloudteamClock.toggleFullscreen);

        this.clock_root.addEventListener('touchstart', () => {
            this.touch_moved = false;
        });

        this.clock_root.addEventListener('touchmove', () => {
            this.touch_moved = true;
        });

        this.clock_root.addEventListener('touchend', () => {
            if (!this.touch_moved) return;

            // toggle style
            this.style_index = (this.style_index + 1) % this.styles.length;
            this.clock_root.style.color = this.styles[this.style_index].text;
            document.querySelector('.wrapper').style.backgroundColor = this.styles[this.style_index].background;
        });

        self.redraw();

        setInterval(function() {
            self.redraw();
        }, 10000);
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

        this.date.innerHTML = time.toDateString();
    }

    static async toggleFullscreen() {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    }
}