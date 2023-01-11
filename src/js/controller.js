import * as model from './model.js';
import { MODAL_CLOSE_SECONDS } from './config.js';
import recipeView from './views/recipeView.js';
import 'core-js/stable';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

///////////////////////////////////////
//making the loading spinner

//showing recipe
async function controlRecipe() {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    resultsView.update(model.getSearchResultsPage());

    await model.loadRecipe(id);

    recipeView.render(model.state.recipe);
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
}

async function controlSearchResults() {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
    //render results

    resultsView.render(model.getSearchResultsPage());

    //render initiial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
}
function controlPagination(goToPage) {
  //Render NEW Results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //Render NEW pagination buttons
  paginationView.render(model.state.search);
}
function controlServings(newServings) {
  //update the recipe servings(in state)
  model.updateServings(newServings);
  //update the recipe view
  recipeView.update(model.state.recipe);
}
function controlAddBookmark() {
  //add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //update recipe view
  recipeView.update(model.state.recipe);
  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
}
async function controlAddRecipe(newRecipe) {
  try {
    //Show user loading spinner
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    //render recipe from the upload form
    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);
    //display success message
    addRecipeView.renderMessage();
    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);
    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SECONDS * 1000);
  } catch (err) {
    console.error(err, '!!!!!');
    addRecipeView.renderError(err.message);
  }
}

function init() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();
