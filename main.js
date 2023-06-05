function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const levenshtein = (function () {
    function _min(d0, d1, d2, bx, ay) {
        return d0 < d1 || d2 < d1
            ? d0 > d2
                ? d2 + 1
                : d0 + 1
            : bx === ay
                ? d1
                : d1 + 1;
    }

    return function (a, b) {
        if (a === b) {
            return 0;
        }

        if (a.length > b.length) {
            var tmp = a;
            a = b;
            b = tmp;
        }

        var la = a.length;
        var lb = b.length;

        while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
            la--;
            lb--;
        }

        var offset = 0;

        while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
            offset++;
        }

        la -= offset;
        lb -= offset;

        if (la === 0 || lb < 3) {
            return lb;
        }

        var x = 0;
        var y;
        var d0;
        var d1;
        var d2;
        var d3;
        var dd;
        var dy;
        var ay;
        var bx0;
        var bx1;
        var bx2;
        var bx3;

        var vector = [];

        for (y = 0; y < la; y++) {
            vector.push(y + 1);
            vector.push(a.charCodeAt(offset + y));
        }

        var len = vector.length - 1;

        for (; x < lb - 3;) {
            bx0 = b.charCodeAt(offset + (d0 = x));
            bx1 = b.charCodeAt(offset + (d1 = x + 1));
            bx2 = b.charCodeAt(offset + (d2 = x + 2));
            bx3 = b.charCodeAt(offset + (d3 = x + 3));
            dd = (x += 4);
            for (y = 0; y < len; y += 2) {
                dy = vector[y];
                ay = vector[y + 1];
                d0 = _min(dy, d0, d1, bx0, ay);
                d1 = _min(d0, d1, d2, bx1, ay);
                d2 = _min(d1, d2, d3, bx2, ay);
                dd = _min(d2, d3, dd, bx3, ay);
                vector[y] = dd;
                d3 = d2;
                d2 = d1;
                d1 = d0;
                d0 = dy;
            }
        }

        for (; x < lb;) {
            bx0 = b.charCodeAt(offset + (d0 = x));
            dd = ++x;
            for (y = 0; y < len; y += 2) {
                dy = vector[y];
                vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
                d0 = dy;
            }
        }

        return dd;
    };
})();


let app = {
    data() {
        return {
            data: [{ name: 'loading', description: 'loading' }],
            good: 0,
            bad: 0,
            question: 0,
            answers: [
                { id: 0, clicked: false },
                { id: 0, clicked: false },
                { id: 0, clicked: false },
                { id: 0, clicked: false },
            ],
            show_results: false,
        };
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        },
    },
    methods: {
        showApp(data) {
            this.data = data;
            this.data.forEach((value, id) => {
                value.distances = this.getDistances(id);
                value.sumDistances = value.distances.reduce((s, a) => s + a, 0);
            });
            console.log(this.data);
            document.getElementById('app').setAttribute('style', '');
            this.newQuestion();
        },
        getDistances(id0) {
            return this.data.map((value, id) => {
                if (id === id0) {
                    return 0;
                }
                if (value.distances) {
                    return value.distances[id0];
                }
                return 64 - levenshtein(this.data[id0].name, value.name);
            });
        },
        click(i) {
            if (!this.show_results) {
                this.answers[i].clicked = true;
                if (this.answers[i].id == this.question) {
                    this.good += 1;
                } else {
                    this.bad += 1;
                }
            } else {
                this.newQuestion();
            }

            this.show_results = !this.show_results;
        },
        getRandomDataIndex() {
            return Math.floor(Math.random() * this.data.length)
        },
        getWeightedRandomDataIndex(id0) {
            let v = Math.random() * this.data[id0].sumDistances;
            for (let i = 0; i < this.data[id0].distances.length; i++) {
                v -= this.data[id0].distances[i];
                if (v <= 0) {
                    return i;
                }
            }
            return id0;
        },
        newQuestion() {
            this.question = this.getRandomDataIndex();
            const ids = [this.question];
            for (let i = 0; i < 3; i++) {
                let candidate = this.getWeightedRandomDataIndex(this.question);
                while (ids.includes(candidate)) {
                    candidate = this.getWeightedRandomDataIndex(this.question);
                }
                ids.push(candidate);
            }
            this.answers = shuffle(ids.map(id => {
                return {
                    id: id, clicked: false
                };
            }));
        },
    },
    mounted: function () {
        console.log('app mounted');

        fetch("data.json")
            .then(response => response.json())
            .then(this.showApp);
    },
};

window.onload = () => {
    app = Vue.createApp(app);
    app.mount('#app');
};
