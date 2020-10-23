var dictionariesListDiv = document.getElementById('dictionaries-list');
var selectDictionaryButton = document.getElementById('selected-dictionary');
var listContainer = document.getElementById('dictionaries-list-container');
var iframe = /** @type {!HTMLIFrameElement} */ (document.getElementById('iframe'));

/** @type {!HTMLElement[]} */
var dictionaryItems = [];

function fillDictionariesList() {
  for (var i = 0; i < DICTIONARIES.length; i++) {
    var itemDiv = createDictionaryItem(i);
    itemDiv.addEventListener('click', handleClickDictionaryItem);
    dictionariesListDiv.appendChild(itemDiv);
    dictionaryItems.push(itemDiv);
  }
}

/** @param {!Event} evt */
function handleClickDictionaryItem(evt) {
  var target = evt.currentTarget;
  for (var i = 0; i < dictionaryItems.length; i++) {
    var dictionaryItem = dictionaryItems[i];
    if (target === dictionaryItem) {
      dictionaryItem.classList.add('active');
    } else {
      dictionaryItem.classList.remove('active');
    }
  }
  var el = /** @type {!HTMLElement} */ (target);
  updateSelectDictionaryButtonContent(el);
  document.body.classList.remove('dropdown-open');
}

/**
 * @param {!number} index
 * @return {!HTMLDivElement}
 */
function createDictionaryItem(index) {
  var lang = DICTIONARIES[index];
  var itemDiv = document.createElement('div');
  itemDiv.setAttribute('value', lang.value);
  itemDiv.className = 'dictionary-item' + (index == SELECTED_DICTIONARY_INDEX ? ' active' : '');
  itemDiv.setAttribute('dictionary', lang.value);

  var span = document.createElement('span');
  span.textContent = lang.title;

  var icon = document.createElement('img');
  icon.src = lang.icon;

  itemDiv.appendChild(icon);

  itemDiv.appendChild(span);
  return itemDiv;
}

function handleClickSelectDictionaryButton() {
  document.body.classList.toggle('dropdown-open');
}

function generateIframeUrl(dictionary){
  var params = window.location.search.replace(/^\?/, '').split('&').map(function(param){
    // Parse parameters and add dictionary selection
    if (/^parameters=/.test(param)){
      var strValue = decodeURIComponent(param.replace(/^parameters=/, ''));
      try {
        var value = JSON.parse(strValue);
        if (!value || typeof(value) !== 'object' || value.forEach !== undefined){
          throw new Error('Invalid parameters value.');
        }
        
        value['dictionary'] = dictionary;
        param = 'parameters=' + JSON.stringify(value);
      }
      catch (err){
        // Use simple replacement
        param = 'parameters=' + encodeURIComponent(strValue.replace(/[\s}]+$/, '') + ',"dictionary":"' + dictionary + '"}');
      }
    }

    return param;
  });
  
  var url = 
    window.location.protocol + '//' +
    window.location.host +
    window.location.pathname +
    '?' + params.join('&') +
    window.location.hash;
  
    return url;
}

/** @param {HTMLElement=} el */
function updateSelectDictionaryButtonContent(el) {
  selectDictionaryButton.innerHTML = '';
  var index = 0;
  if (el) {
    index = dictionaryItems.indexOf(el);
  }
  selectDictionaryButton.appendChild(createDictionaryItem(index));
  selectDictionaryButton.style.width = dictionariesListDiv.offsetWidth + 'px';
}

// :::::::::::::: MAIN :::::::::::::: //
fillDictionariesList();
var activeElement = /** @type {!HTMLElement} */(listContainer.getElementsByClassName('active')[0]);
updateSelectDictionaryButtonContent(activeElement);
selectDictionaryButton.addEventListener('click', handleClickSelectDictionaryButton);

window.addEventListener('click', function () {
  document.body.classList.remove('dropdown-open');
});

listContainer.addEventListener('click', function (evt) {
  evt.stopPropagation();
});

window.addEventListener('blur', function () {
  if (document.activeElement === iframe) {
    document.body.classList.remove('dropdown-open');
  }
});

var items = dictionariesListDiv.getElementsByClassName('dictionary-item');
for (var i = 0; i < items.length; i++){
  items[i].addEventListener('click', function(e){
    var dictionary = this.getAttribute('dictionary');
    var url = generateIframeUrl(dictionary);
    // iframe.src = url;
  });
}