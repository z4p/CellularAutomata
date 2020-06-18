class ZCloudteamClock {
    constructor(dom_element_selector) {
        this.clock_root = document.querySelector(dom_element_selector);
        this.clock_hh = this.clock_root.querySelector('.clock__hh');
        this.clock_mm = this.clock_root.querySelector('.clock__mm');

        this.colorHSV = {
            h: 0,
            s: 0,
            v: 1,
        };
        this.color_iterator = 0;

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
            self.colorHSV.h = Math.sin(self.color_iterator)/2 + 0.5;
            self.colorHSV.s = Math.sin(self.color_iterator * 1.5)/2 + 0.5;
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

        this.clock_root.style.color = ZCloudteamClock.HSVtoRGB(this.colorHSV);
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

    static HSVtoRGB(hsv) {
        let s = hsv.s, v = hsv.v, h = hsv.h;
        let r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return 'rgb(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ')';
    }
}