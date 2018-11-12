(function () {
  function displaySearchResults (results, searchItems) {
    var searchResults = document.getElementById('search-results');

    if (results.length) { // Are there any results?
      var appendString = '';

      for (var i = 0; i < results.length; i++) {  // Iterate over the results
        var item = searchItems[results[i].ref];
        appendString += '<li><a href="' + item.url + '"><h3>' + item.title + '</h3></a>';
        appendString += '<p>' + item.content.substring(0, 150) + '...</p></li>';
      }

      searchResults.innerHTML = appendString;
    } else {
      searchResults.innerHTML = '<li>No results found</li>';
    }
  }

  function getQueryVariable (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      if (pair[0] === variable) {
        return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
      }
    }
  }

  function executeSearch (searchTerm, searchItems) {
    var idx = lunr(function () {
      this.ref('id', { boost: 10 });
      this.field('title', { boost: 10 });
      this.field('author');
      this.field('category');
      this.field('content');
      this.field('url');

      searchItems.forEach(function (doc) {
        this.add(doc);
      }, this);
    });
    var results = idx.search(searchTerm);
    displaySearchResults(results, searchItems);
  }

  function loadSearchItems () {
    var searchTerm = getQueryVariable('query');

    if (searchTerm) {
      document.getElementById('current-search').value = searchTerm;
      if (window.searchItems) {
        executeSearch(searchTerm, window.searchItems);
      } else {
        axios.get('/search-data.json')
          .then((response) => {
            window.searchItems = response.data;
            executeSearch(searchTerm, window.searchItems);
          })
          .catch((err) => {
            console.error('Error retrieving search data');
            console.error(err);
          })
      }
    } else {
      displaySearchResults([], undefined);
    }
  }

  window.addEventListener('load', loadSearchItems)
})();