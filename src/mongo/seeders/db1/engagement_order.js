class EngagementOrder {

    constructor() {
        if (!!EngagementOrder.instance) {
            return EngagementOrder.instance;
        }

        const engagements = [];
        const orders = [];
        const types = ['WIDGET_IMPRESSION', 'IMPRESSION', 'SHOW_OVERLAY', 'CLICK', 'ADD_CART_FROM_WIDGET', 'ADD_CART_FROM_DETAIL'];
        const locations = ['HOME', 'PRODUCT_DETAILS', 'PRODUCT_DETAILS_FEATURED', 'CART'];
        const sources = ['SIMILAR', 'MOST_POPULAR', 'LEAST_POPULAR', 'CUSTOM'];
        const devices = ['DESKTOP', 'MOBILE', 'TABLET'];
        const pids = ["439", "453", "437", "454", "438", "700", "701", "702", "435", "456", "457", "703", "707", "708", "704", "710", "706", "709", "705", "714", "715", "716", "717", "718", "712", "720", "721", "711", "722", "713", "725", "726", "719", "724", "729", "730", "727", "732", "733", "734", "723", "736", "731", "735", "728", "738", "737", "742", "739", "740", "745", "744", "743", "741", "749", "747", "746", "752", "753", "754", "755", "756", "748", "751", "757", "750", "761", "758", "762", "760", "763", "764", "759", "765", "767", "766", "770", "769", "772", "768", "771", "773", "774", "776", "778", "780", "777", "781", "783", "775", "779", "784", "782", "785", "787", "788", "786", "789", "790", "793", "791", "796", "792", "794", "795", "797", "798", "799", "801", "800", "803", "805", "804", "802", "806", "807", "808", "809", "810", "811", "814", "813", "816", "818", "812", "819", "821", "815", "817", "823", "820", "822", "824", "827", "825", "826", "828", "832", "829", "830", "831", "835", "834", "836", "839", "833", "837", "840", "838", "844", "842", "843", "841", "845", "846", "847", "848", "849", "850", "853", "851", "852", "854", "858", "856", "855", "857", "862", "864", "860", "861", "863", "868", "866", "867", "865", "870", "869", "872", "873", "871", "875", "876", "874", "877", "H297", "H301", "H298", "H300", "H299", "H302", "H303", "H304", "H305", "H306", "H310", "H307", "H308", "H311", "H309", "H313", "H314", "H312", "H315", "H316", "H317", "H318", "LX14", "LX15", "LX09", "LX08", "WS288", "WS296", "WS297", "WS298", "WS299", "WS289", "WS291", "WS295", "WS300", "WS304", "WS305", "WS307", "WS308", "WS309", "WS310", "WS301", "WS302", "WS303"];
        const countries = [
            {name: 'China', currency: 'CNY', exchangeRate: 6.86475},
            {name: 'Hong Kong', currency: 'HKD', exchangeRate: 7.81631},
            {name: 'United States', currency: 'USD', exchangeRate: 1},
            {name: 'India', currency: 'INR', exchangeRate: 68.3715},
            {name: 'Vietnam', currency: 'VND', exchangeRate: 23211.44},
            {name: 'Australia', currency: 'AUD', exchangeRate: 1.43421},
            {name: 'Indonesia', currency: 'IDR', exchangeRate: 14065.68},
            {name: 'South Korea', currency: 'KRW', exchangeRate: 1173.22},];
        const startDate = new Date(2016, 0, 1);

        function randomDate(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }


        function random(start, end, float) {
            let rand = 0;
            if (!float) {
                rand = Math.random() * (end + 1) + start;
                return Math.floor(rand);
            }
            rand = Math.random() * end + start;
            return rand;
        }

        function getUser() {
            const rand = Math.floor(Math.random() * 2147483647);
            const uid = `rra.${rand}.${randomDate(startDate, new Date()).getTime()}`;
            const crand = random(0, countries.length - 1);
            const geo_location = countries.map((c => c.name))[crand];
            const currency = countries.map((c => c.currency))[crand];
            const exchangeRate = countries.map((c => c.exchangeRate))[crand];

            return {uid, geo_location, currency, exchangeRate};
        };

        function getEngagement({pid, uid, type, geo_location, source, location, device, order, createdAt}) {
            pid = pid || pids[random(0, pids.length - 1)];
            type = type || types[random(0, types.length - 1)];
            source = sources[random(0, sources.length - 1)];
            location = locations[random(0, locations.length - 1)];
            device = devices[random(0, devices.length - 1)];
            createdAt = createdAt || randomDate(startDate, new Date());
            const updatedAt = createdAt;

            return {
                uid,
                pid,
                type,
                geo_location,
                source,
                location,
                device,
                order,
                updatedAt,
                createdAt,
            }
        };

        function getOrder({uid, geo_location, currency, exchangeRate}) {
            const oid = `${Math.floor(Math.random() * 2147483647)}.${randomDate(startDate, new Date()).getTime()}`;
            const noOfItems = random(1, 10);
            const location = locations[random(0, locations.length - 1)];
            const source = sources[random(0, sources.length - 1)];
            const device = devices[random(0, devices.length - 1)];
            const createdAt = randomDate(startDate, new Date());
            const updatedAt = createdAt;
            const items = [];

            for (let i = 0; i < noOfItems; i++) {
                const pid = pids[random(0, pids.length - 1)];
                if (items.find((item) => item.pid === pid)) {
                    continue;
                }
                const price = parseFloat(random(50, 200, true).toFixed(2));
                const quantity = random(1, 5);
                const isRecommended = random(0, 1, true) > 0.3;
                const item = {
                    pid,
                    price,
                    currency,
                    quantity,
                    exchangeRate,
                    isRecommended,
                };
                if (isRecommended) {
                    const engagement = getEngagement({
                        pid,
                        type: 'PURCHASE',
                        geo_location,
                        source,
                        location,
                        device,
                        order: {
                            oid,
                            quantity,
                            price,
                            currency,
                            exchangeRate,
                        },
                        createdAt,
                    });
                    engagements.push(engagement);
                }
                items.push(item);
            }
            return ({
                oid,
                uid,
                geo_location,
                device,
                location,
                source,
                items,
                createdAt,
                updatedAt,
            });
        }
        function generateEngagements() {
            const noOfUsers = random(100, 300);

            for (let u = 0; u < noOfUsers; u++) {
                const user = getUser();
                const noOfEngagements = random(100, 1000);
                const noOfOrders = random(0, noOfEngagements);
                for (let e = 0; e < noOfEngagements; e++) {
                    const engagement = getEngagement({...user});
                    engagements.push(engagement);
                }

                for (let o = 0; o < noOfOrders; o++) {
                    const order = getOrder({...user});
                    orders.push(order);
                }
            }
        }
        generateEngagements();
        this.engagements = engagements;
        this.orders = orders;
        EngagementOrder.instance = this;
        return this;
    }
}

module.exports = EngagementOrder;