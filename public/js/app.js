// Countable.count(document.querySelector('.article-body'), counter => (
const readTime = document.querySelector('.read-time');
Countable.count(document.querySelector('.article-body'), function (counter) {
  var wpm = 200,
    estimatedRaw = counter.words / wpm,
    minutes = Math.round(estimatedRaw);

  var effectiveTime = minutes < 1 ? 'a couple of secs' : minutes + ' min read';

  readTime.innerHTML = `<i class="far fa-clock"></i> ${effectiveTime}`;
});
// ))
