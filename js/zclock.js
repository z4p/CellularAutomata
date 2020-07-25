class ZCloudteamClock {
    constructor(dom_element_selector) {
        this.clock_root = document.querySelector(dom_element_selector);
        this.clock_hh = this.clock_root.querySelector('.clock__hh');
        this.clock_mm = this.clock_root.querySelector('.clock__mm');
        this.styles = [
            {background: '#000', text: '#FFF'},
            {background: '#FFF', text: '#000'},
            {background: '#000', text: '#B33'},
        ];

        this.style_index = 0;

        this.color_iterator = 0;

        const self = this;

        this.clock_root.addEventListener('touchstart', ZCloudteamClock.toggleFullscreen());

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
            document.body.style.backgroundColor = this.styles[this.style_index].background;
        });

        setInterval(function() {
            /*
            self.colorHSV.h = Math.sin(self.color_iterator)/2 + 0.5;
            self.colorHSV.s = Math.sin(self.color_iterator * 1.5)/2 + 0.5;
            self.clock_root.style.color = ZCloudteamClock.HSVtoRGB(this.colorHSV);
             */
            self.redraw();
            self.color_iterator += 0.01;
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