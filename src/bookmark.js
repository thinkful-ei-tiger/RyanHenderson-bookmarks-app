import $ from 'jquery';
import api from './api';
import store from './store';
$.fn.extend({
  serializeJson: function() {
    const formData = new FormData(this[0]);
    const o = {};
    formData.forEach((val, name) => o[name] = val);
    return JSON.stringify(o);
  }
});
const generateItemElement = function (item) {
  if(!item.checked){
    return `
    <li class="js-item-element" data-item-id="${item.id}">
      ${item.title}  ${item.rating}★
      <div class ='linebreak'></div>
    </li>`;
  }else{
    return ` <li class="js-item-element" data-item-id="${item.id}">
    ${item.title} <a href="${item.url}">${item.url}</a> ${item.rating}★ <br>
    ${item.desc}
    <input type="button" value="delete" class = 'js-item-delete'>
    <div class ='linebreak'></div>
  </li><br>`;
  }
};
const handleNewItemSubmit = function () {
  $('.container').on('submit','#js-bookmarks-form',(function (event) {
    event.preventDefault();
    // const newItemName = $(event.target).serializeJson();
    const newItem ={
      title:$('#bookmark-title').val(),
      url:$('#website-url').val(),
      rating:$('input[type=\'radio\'][name=\'rating\']:checked').val(),
      desc:$('[name="description"]').val(),
      checked:false  };  
    api.createItem(newItem)
      .then(res =>res.json())
      .then((myItem)=> {
        store.addItem(myItem);
        render();
      })
      .catch((error) => {
        store.setError(error.message);
        renderError();
      });
  }));
};
const generateError = function (message) {
  return `
        <section class="error-content">
          <button id="cancel-error">X</button>
          <p>${message}</p>
        </section>
      `;
};
  
const renderError = function () {
  if (store.error) {
    const el = generateError(store.error);
    $('.error-container').html(el);
  } else {
    $('.error-container').empty();
  }
};
const mainPage = function(){
  const mainPage = `    <h1>Bookmarks app</h1>
  <div class ="error-container"></div>
  <div class="ui">
      <input type="button" value="add bookmark" class='AddBookmark'>
  <div>
      <label for="filter">Filter by:</label>
      <select id="filter" name="filterlist" form="filterform">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    </select>
    <input type="button" value="filter" class='filter'>
  </div>
  
</div>
  <ul class="bookmarks">
  </ul>
</div>`;
  return mainPage;
};
const addBookmarkPage = function(){
  const addPage =`    <h1>Bookmarks app</h1>
  <div class ="error-container"></div>
  <form id="js-bookmarks-form">
      <label for="bookmark-title">Add new bookmark:</label><br>
      <input type="text" name="title" id="bookmark-title" required/><br>
      <label for="website url">Link:</label><br>
      <input type="text" name="url" id="website-url" required /><br>
      <fieldset class="rating">
      <legend>Rating:</legend>
      <input type="radio" id="star5" name="rating" value="5" /><label for="star5" title="Rocks!">5 stars</label>
      <input type="radio" id="star4" name="rating" value="4" /><label for="star4" title="Pretty good">4 stars</label>
      <input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="Meh">3 stars</label>
      <input type="radio" id="star2" name="rating" value="2" /><label for="star2" title="Kinda bad">2 stars</label>
      <input type="radio" id="star1" name="rating" value="1" /><label for="star1" title="Sucks">1 star</label>
  </fieldset>
      <textarea rows="4" cols="40" name="description" form="usrdescription">
              Enter a description...(optional)</textarea><br>
       <input type="button" value="cancel" class = 'mainPage'>
       <input type="submit" value="submit">

  </form>`;
  $('.container').html(addPage);
};
const handleAddBookmark = function (){
  $('.container').on('click', '.AddBookmark', event => {
    store.adding=!store.adding;
    render();});
};

const handleCancelButton = function(){
  $('.container').on('click', '.mainPage', event => {
    // store.adding=!store.adding;
    render();});
};
const handlefilterButton = function(){
  $('.container').on('click', '.filter', event => {
    store.filter = document.getElementById('filter').value;
    render();});
};

const getItemIdFromElement = function (item) {
  return $(item)
    .closest('.js-item-element')
    .data('item-id');
};
const handleClickBookmark = function () {
  $('.container').on('click', '.js-item-element', event => {
    const id = getItemIdFromElement(event.currentTarget);
    const item = store.findById(id);
    store.findAndUpdate(id, { checked: !item.checked });
    render();
  });
};
const handleDeleteBookmark = function () {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.container').on('click', '.js-item-delete', event => {
    // get the index of the item in store.items
    const id = getItemIdFromElement(event.currentTarget);
    console.log(`this is ${id}`);
    // delete the item
    //store.findAndDelete(id);
    // render the updated shopping list
    api.deleteItem(id)
      .then(res => res.json())
      .then(() => {
        store.findAndDelete(id);
        render();
      })
      .catch((error) => {
        console.log(error);
        store.setError(error.message);
        renderError();
      });
  });
};
// const handleClickBookmark = function () {
//   $('.container').on('click', '.js-item-element', event => {
//     const id = getItemIdFromElement(event.currentTarget);
//     const item = store.findById(id);
//     console.log(item);
//     api.updateItem(id, { checked: !item.checked })
//       .then(() => {
//         store.findAndUpdate(id, { checked: !item.checked });
//         render();
//       })
//       .catch((error) => {
//         console.log(error);
//         store.setError(error.message);
//         renderError();
//       });
//   });
// };
const bindEventListener = function (){
  handlefilterButton();
  handleClickBookmark();
  handleDeleteBookmark();
  handleAddBookmark();
  handleCancelButton();
  handleNewItemSubmit();
};
const generateBookmarkString = function (bookmarks) {
  const items = bookmarks.map((item) => generateItemElement(item));
  return items.join('');
};
const render = function () {
  renderError();
  store.error=false;
  if(store.adding){
    addBookmarkPage();
    store.adding=!store.adding;
  }else{
    $('.container').html(mainPage());
    // Filter item list if store prop is true by item.checked === false
    let items = [...store.bookmarks];

    if (store.filter) {
      items = items.filter(item => item.rating >= store.filter);
    }
    // render the shopping list in the DOM
    const bookmarkString = generateBookmarkString(items);
  
    // insert that HTML into the DOM
    $('.bookmarks').html(bookmarkString);
  }
};

// This object contains the only exposed methods from this module:
export default {
  render,
  bindEventListener
};