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
    const newItem ={
      title:$('#bookmark-title').val(),
      url:$('#website-url').val(),
      rating:$('input[type=\'radio\'][name=\'rating\']:checked').val(),
      desc:$('[name="description"]').val(),
      checked:false  };  
    api.createItem(newItem)
    
      .then(res =>{
        if(res.ok){
          return res.json();
        }
        throw new Error(res.statusText);
      })
      .then((myItem)=> {
        store.toggleStoreAdding();
        store.addItem(myItem);
        render();
      })
      .catch((error) => {
        store.setError(error.message);
        render();
      });
  }));
};
const generateError = function (message) {
  return `
          <button id="cancel-error">X</button>
          <p>${message}</p>
      `;
};
  
const renderError = function () {
  if (store.error) {
    const el = generateError(store.error);
    $('.error-content').html(el);
  }else{
    $('.error-content').empty();
  }
};
const mainPage = function(){
  const mainPage = `   <header> <h1>Bookmarks app</h1></header>
  <section class="error-content"></section>
  <div class="ui">
      <input type="button" value="add bookmark" class='AddBookmark'>
      <label for="filter">Filter by:</label>
      <select id="filter" name="filterlist">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    </select>
    <input type="button" value="filter" class='filter'>
</div>
  <ul class="bookmarks">
  </ul>
`;
  return mainPage;
};
const addBookmarkPage = function(){
  const addPage =`    <h1>Bookmarks app</h1>
  <section class="error-content"></section>
  <form id="js-bookmarks-form">
      <label for="bookmark-title">Add new bookmark:</label><br>
      <input type="text" name="title" id="bookmark-title" required/><br>
      <label for="website url">Link:</label><br>
      <input type="text" name="url" id="website-url" required /><br>
      <fieldset class="rating">
      <legend>Rating:</legend>
      <input type="radio" id="star5" name="rating" value="5" /><label for="star1" title="Sucks">1 stars</label>
      <input type="radio" id="star4" name="rating" value="4" /><label for="star2" title="Kinda bad">2 stars</label>
      <input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="Meh">3 stars</label>
      <input type="radio" id="star2" name="rating" value="2" /><label for="star4" title="Kinda good">4 stars</label>
      <input type="radio" id="star1" name="rating" value="1" /><label for="star5" title="Rocks!">5 star</label>
  </fieldset>
      <textarea rows="4" cols="40" name="description" placeholder="Enter a description...(optional)"></textarea><br>
       <input type="button" value="cancel" class = 'mainPage'>
       <input type="submit" value="submit">

  </form>`;
  $('.container').html(`${addPage}`);
};
const handleAddBookmark = function (){
  $('.container').on('click', '.AddBookmark', event => {
    store.toggleStoreAdding();
    render();});
};

const handleCancelButton = function(){
  $('.container').on('click', '.mainPage', event => {
    store.toggleStoreAdding();
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
    // delete the item
    // render the updated shopping list
    api.deleteItem(id)
      .then(res =>{
        if(res.ok){
          return res.json();
        }
        throw new Error(res.statusText);
      })
      .then(() => {
        store.findAndDelete(id);
        render();
      })
      .catch((error) => {
        store.setError(error.message);
        render();
      });
  });
};

const handleErrorButton = function (){
  $('.container').on('click', '#cancel-error', event => {
    store.error = null;
    render();
  });
};
const bindEventListener = function (){
  handleErrorButton();
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
  if(store.adding){
    addBookmarkPage();
    renderError();
  }else{
    $('.container').html(`${mainPage()}`);
    renderError();
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