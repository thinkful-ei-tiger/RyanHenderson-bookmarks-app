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
  let itemTitle = `${item.name.title}`;
  return `
    <li class="js-item-element" data-item-id="${item.id}">
      ${itemTitle} ${item.name.url} ${item.name.rating}
    </li>`;
};
const handleNewItemSubmit = function () {
  $('.container').on('submit','#js-bookmarks-form',(function (event) {
    event.preventDefault();
    // const newItemName = $(event.target).serializeJson();
    const newItem ={
      title:$('#bookmark-title').val(),
      url:$('#website-url').val(),
      rating:$('input[type=\'radio\'][name=\'rating\']:checked').val(),
      description:$('[name="description"]').val()  };   
    api.createItem(newItem)
      .then(res =>res.json())
      .then((myItem)=> {
        store.addItem(myItem);
        render();
      })
      .catch((error) => {
        store.setError(error.message);
        console.log('hey there was an error');
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
        <option value="none">None</option>
        <option value="name">Name</option>
        <option value="rating">Rating</option>
      </select>
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
          <span class="star-rating">
              <input type="radio" name="rating" value="1" required><i></i>
              <input type="radio" name="rating" value="2"><i></i>
              <input type="radio" name="rating" value="3"><i></i>
              <input type="radio" name="rating" value="4"><i></i>
              <input type="radio" name="rating" value="5"><i></i>
              <input type="radio" name="rating" value="6"><i></i>
              <input type="radio" name="rating" value="7"><i></i>
              <input type="radio" name="rating" value="8"><i></i>
              <input type="radio" name="rating" value="9"><i></i>
              <input type="radio" name="rating" value="10"><i></i>
            </span>
      <textarea rows="4" cols="50" name="description" form="usrdescription">
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
const bindEventListener = function (){
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

    // if (store.filter) {
    //   items = items.filter(item => item.rating >= store.filter);
    // }
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