const tabs = [...document.querySelectorAll('[role="tab"]')];
const story = document.querySelector('.insights');
const track = document.querySelector('.story-track');
const phone = document.querySelector('.phone');
const layers = [...document.querySelectorAll('.screen-layer')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const shortViewport = window.matchMedia('(max-height: 540px)');
const mobileViewport = window.matchMedia('(max-width: 900px)');
const staticStory = () => reducedMotion.matches || shortViewport.matches;
const panStory = () => mobileViewport.matches && !staticStory();

let activeIndex = -1;
let screenTravel = layers.map(() => 0);
let pending = false;
const clamp = value => Math.max(0, Math.min(1, value));
function chapterAt(progress) {
 const position = clamp(progress) * tabs.length;
 const index = Math.min(tabs.length - 1, Math.floor(position));
 const localProgress = position - index;
 // Pause at the top and bottom so the full screenshot can be read.
 const travelProgress = clamp((localProgress - 0.10) / 0.72);
 const pan = travelProgress * travelProgress * (3 - 2 * travelProgress);
 return {index, localProgress, pan};
}
function showChapter(index) {
 if (activeIndex === index) return;
 activeIndex = index;
 const tab = tabs[index], view = tab.dataset.view;
 tabs.forEach((item, i) => {
  const active = i === index;
  item.classList.toggle('active', active);
  item.setAttribute('aria-selected', String(active));
  item.tabIndex = active ? 0 : -1;
  item.querySelector('.tab-description').hidden = !active;
  item.querySelector('.tab-description').setAttribute('aria-hidden', String(!active));
  item.querySelector('.tab-mark').textContent = active ? '−' : '+';
 });
 layers.forEach(layer => {
  const visible = layer.dataset.screen === view;
  layer.classList.toggle('is-visible', visible);
  layer.setAttribute('aria-hidden', String(!visible));
  layer.alt = visible ? window.ozukLocale.t(`${view}Alt`) : '';
 });
 story.dataset.chapter = view;
 document.getElementById('app-panel').setAttribute('aria-labelledby', tab.id);
 document.getElementById('screen-index').textContent = `0${index + 1} / 04`;
 document.querySelector('.mobile-story').textContent = tab.querySelector('.tab-description').textContent;
}
function storyRange() {
 const start = track.getBoundingClientRect().top + window.scrollY;
 const distance = track.offsetHeight - document.querySelector('.insights-sticky').offsetHeight;
 return {start, distance:Math.max(1,distance)};
}
function selectChapter(index) {
 if (staticStory()) {showChapter(index); return;}
 const {start,distance} = storyRange();
 // Land just inside the chapter, before its screenshot begins to move.
 const progress = panStory() ? (index + 0.015) / tabs.length : index / (tabs.length - 1);
 window.scrollTo({top:start + distance * progress, behavior:'smooth'});
}
tabs.forEach((tab,index) => {
 tab.addEventListener('click', () => selectChapter(index));
 tab.addEventListener('keydown', event => {
  let next;
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;
  if (next !== undefined) {event.preventDefault(); tabs[next].focus({preventScroll:true}); selectChapter(next);}
 });
});
function measureScreens() {
 screenTravel = layers.map(layer => Math.max(0, layer.getBoundingClientRect().height - phone.clientHeight));
 requestUpdate();
}
function updateScroll() {
 pending = false;
 document.querySelector('.insight-tabs').setAttribute('aria-orientation', mobileViewport.matches ? 'horizontal' : 'vertical');
 const bounds = story.getBoundingClientRect();
 const onLightSection = bounds.top < innerHeight / 2 && bounds.bottom > innerHeight / 2;
 document.documentElement.style.setProperty('--scroll-surface', onLightSection ? 'var(--paper)' : 'var(--bg)');
 document.documentElement.style.setProperty('--scroll-thumb', onLightSection ? '#748276' : '#81918b');
 if (staticStory()) return;
 const {start,distance} = storyRange();
 const progress = clamp((window.scrollY-start)/distance);
 story.style.setProperty('--story-progress', progress);
 if (panStory()) {
  const {index, localProgress, pan} = chapterAt(progress);
  // Position the incoming image before making it visible; outgoing image keeps its last position.
  layers[index].style.setProperty('--screen-y', `${-screenTravel[index] * pan}px`);
  tabs.forEach((tab,i) => tab.style.setProperty('--chapter-progress', i < index ? 1 : i === index ? localProgress : 0));
  showChapter(index);
 } else {
  showChapter(Math.round(progress * (tabs.length - 1)));
 }
}
function requestUpdate() {if (!pending) {pending=true;requestAnimationFrame(updateScroll);}}
window.addEventListener('scroll',requestUpdate,{passive:true});
window.addEventListener('resize',measureScreens);
[reducedMotion,shortViewport,mobileViewport].forEach(query => query.addEventListener('change',measureScreens));
layers.forEach(layer => layer.addEventListener('load',measureScreens));
const screenObserver = new ResizeObserver(measureScreens);
screenObserver.observe(phone);
layers.forEach(layer => screenObserver.observe(layer));
document.addEventListener('ozuk:localechange', () => {
 const index=Math.max(0,activeIndex);activeIndex=-1;showChapter(index);measureScreens();
});
showChapter(0);
measureScreens();
