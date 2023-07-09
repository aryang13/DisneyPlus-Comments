const main = document.getElementById('main');

const reviewsButton = document.getElementById('reviews-button');
reviewsButton.addEventListener('click', reloadReviews);

document.getElementById('go-to-account').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

document.getElementById('forums-button').addEventListener('click', () => {
    chrome.tabs.create({
        url: 'forum.html',
    });
});

let disneyplusid = '';
let title = '';

function createReviewElement(r) {
    const analytics = r.avgrating && r.numreviews ? ` (avg: ${r.avgrating}, n: ${r.numreviews})` : '';

    return createDOM(
        `<div class='review'>
            <p class='username'>${r.username}${analytics}</p>
            <p>Rating: ${r.numericalrating}, ${r.phraserating}</p>
            <p>Content: ${r.content}</p>
        </div>`
    );
}

async function postReview(content, numericalrating, disneyplusid, title) {
    console.log(content, numericalrating, disneyplusid, title);

    const review = {
        content,
        numericalrating,
        disneyplusid,
        title,
    };

    const phraserating = {
        1: 'Terrible',
        2: 'Below Average',
        3: 'Average',
        4: 'Above Average',
        5: 'Incredible',
    };

    const { reviewid } = await Client.post('post/review', review);
    review.reviewid = reviewid;
    review.username = await Client.getUsername();
    review.phraserating = phraserating[numericalrating];

    main.insertBefore(createReviewElement(review), main.firstChild.nextSibling);
}

async function reloadReviews() {
    emptyDOM(main);

    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true }, );
    
    let url = tabs[0]?.url?.toString();

    if(!url) return;

    const match = url.match(/https?:\/\/(www\.)disneyplus\.com\/.*\/(?<title>.*)\/(?<id>.*)/);

    if(match) {
        disneyplusid = match.groups.id;
        title = match.groups.title.replace('-', ' ');
    } else {
        alert("Please navigate to a Disney Plus show page.");
        return;
    }


    const averageReviewsList = await Client.get('analytics/reviews-per-user');
    const averageReviews = {};

    averageReviewsList.forEach(x => averageReviews[x.username] = x);
    
    console.log(averageReviews);

    const reviews = await Client.get('post/reviews', {
        disneyplusid: disneyplusid,
    })

    console.log(reviews);
    renderReviewInputs();

    reviews.forEach((r) => {
        r.avgrating = averageReviews[r.username].avgrating;
        r.numreviews = averageReviews[r.username].numreviews;

        const reviewElem = createReviewElement(r);
        main.insertBefore(reviewElem, main.firstChild.nextSibling);
        // main.appendChild(reviewElem);
    });
    
}

function renderReviewInputs() {
    const reviewInput = createDOM(`
        <div id='review-input'>
            <p>Write a review:</p>
            <textarea id='review-text' rows='5' cols='30'></textarea>
            <label for='review-rating'>Number of stars:</label>
            <input id='review-rating' name='review-rating' type='number' min='1' max='5'>
            <button id='review-button'>Post</button>
        </div>
    `);

    main.appendChild(reviewInput);
    const reviewText = document.getElementById('review-text');
    const reviewRating = document.getElementById('review-rating');
    const reviewButton = document.getElementById('review-button');
    reviewButton.addEventListener('click', () => {
        if(!reviewText.value || !reviewRating.value) {
            return alert("Please include a review and rating");
        }

        postReview(reviewText.value, reviewRating.value, disneyplusid, title);
        reviewText.value = '';
        reviewText.rating = '';
    });
}

// Removes the contents of the given DOM element (equivalent to elem.innerHTML = '' but faster)
function emptyDOM(elem) {
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// Creates a DOM element from the given HTML string
function createDOM(htmlString) {
    let template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}
