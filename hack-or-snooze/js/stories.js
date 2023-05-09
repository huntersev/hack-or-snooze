"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? getDeleteBtn(): ''}
        ${showStar ? getStarBtn(story, currentUser): ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// create delete & favorites buttons
function getDeleteBtn() {
  return `
    <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
    </span>`;
}

function getStarBtn(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? 'fas' : 'far';
  return `
  <span class="star">
    <i class="${starType} fa-star"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// submitting a new story
async function submitNewStory(evt) {
  console.debug('submitNewStory');
  evt.preventDefault();

  const title = $('#submit-title').val();
  const url = $('#submit-url').val();
  const author = $('#submit-author').val()
  const username = currentUser.username
  const storyData = {title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  hidePageComponents();
  putStoriesOnPage();
}
 
$submitForm.on('submit', submitNewStory);

// deleting a story
async function deleteStory(evt) {
  console.debug('deleteStory');

  const $closestLi = $(evt.target).closest('li');
  const storyId = $closestLi.attr('id');

  await storyList.deleteStory(currentUser, storyId);

  await putMyStoriesOnPage();
}

$myStories.on('click', '.trash-can', deleteStory);

// generate "my"(logged in users) stories
function putMyStoriesOnPage() {
  console.debug('putMyStoriesOnPage');

  $myStories.empty();

  if (currentUser.ownStories.length === 0) {
    $myStories.append("<h5>You have no added stories!</h5>");
  } else {
    for (let story of currentUser.ownStories){
      let $story = generateStoryMarkup(story, true);
      $myStories.append($story);
    }
  }
  $myStories.show();
}

// generate favorites list
function putFavoritesListOnPage(){
  console.debug('putFavoritesListOnPage');

  $favoriteStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoriteStories.append('<h5>You have no favorited stories!</h5>');
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStories.append($story);
    }
  }
  $favoriteStories.show();
}

// handle favorite and unfavorite functions
async function toggleFavorite(evt) {
  console.debug('toggleFavorite');

  const $tar = $(evt.target);
  const $closestLi = $tar.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($tar.hasClass('fas')) {
    await currentUser.removeFavorite(story);
    $tar.closest("i").toggleClass('fas far')
  } else {
    await currentUser.addFavorite(story);
    $tar.closest('i').toggleClass('fas far');
  }
}

$allStoriesList.on('click', '.star', toggleFavorite);
