
function bindNavEvents () {
    const navs = Array.from(document.getElementsByClassName('nav'));

    navs.forEach((nav: Element) => {
        // skip if disabled
        if (nav.classList.contains('disabled')) {
            return;
        }

        // show when not on full schedule
        nav.classList.add('enabled');

        // get the associated day number from the element's ID
        const targetNumber = parseInt(nav.id.replace(RE_DAY_NUMBER, '$1'), 10);

        nav.addEventListener('click', (evt: Event) => {
            showDay(targetNumber);
        });
    });

    const toggle = document.getElementById('toggleEveryDay');
    if (toggle) {
        toggle.addEventListener('click', toggleEveryDay);
        toggle.parentElement?.classList.add('enabled');
    }
}

// const counter = [][];
// function initCounter () {
//     counter.fill(0, 0, 3)

// }

const NUM_DECKS = 1;

document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.getElementsByClassName('card'));

    if (cards) {
        cards.forEach(card => {
            const cardValue = card.getAttribute('data-value');
            const cardSuit  = card.getAttribute('data-suit');
            const cardCountEl = document.getElementById(`${cardValue}_${cardSuit}_count`) as HTMLInputElement;

            // init to 1 per deck
            cardCountEl.value = NUM_DECKS.toString();

            let cardValueCount = NUM_DECKS * 4;
            let cardValuePercent = cardValueCount / 52;

            document.getElementById(`${cardValue}_${cardSuit}_dec`)?.addEventListener('click', () => {
                cardCountEl.value = (Math.max(0, parseInt(cardCountEl.value, 10) - 1)).toString();
                cardValuePercent = --cardValueCount / 52;
            });

            document.getElementById(`${cardValue}_${cardSuit}_inc`)?.addEventListener('click', () => {
                cardCountEl.value = (0, parseInt(cardCountEl.value, 10) + 1).toString();
            });
        });
    };
});
