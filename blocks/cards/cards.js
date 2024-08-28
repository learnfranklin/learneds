import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* Change to ul, li */
  const ul = document.createElement('ul');
  ul.classList.add('card-list');

  const sliderActive = block.children.length > 2;

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('card-item');

    const carouselIndicators = document.createElement('div');
    carouselIndicators.classList.add('indicators');

    const wrapperElement = document.createElement('p');

    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    [...li.children].forEach((div) => {
      const anchors = div.querySelectorAll('a');
      const pictures = div.querySelectorAll('picture');

      if (anchors.length === 2) {
        div.className = 'cards-card-brochure';
      } else if (pictures.length > 0) {
        div.className = 'card-carousel-image';
      } else if (div.querySelector('h2')) {
        div.className = 'cards-card-title';
      } else {
        div.className = 'cards-card-body';
      }

      if (pictures.length === 1 && anchors.length === 0) {
        div.classList.add('onlyOne');
        while (div.firstChild) {
          wrapperElement.appendChild(div.firstChild);
        }
        div.appendChild(wrapperElement);
        div.append(carouselIndicators);
      } else if (pictures.length > 1) {
        div.append(carouselIndicators);
      }
    });

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    );
  });

  block.textContent = '';
  block.append(ul);

  if (sliderActive) {
    const leftArrow = document.createElement('div');
    leftArrow.classList.add('leftSlider');
    leftArrow.textContent = '‹';
    block.append(leftArrow);

    const rightArrow = document.createElement('div');
    rightArrow.classList.add('rightSlider');
    rightArrow.textContent = '›';
    block.append(rightArrow);

    let currentIndex = 0;
    const cardList = block.querySelector('.card-list');
    const cardItems = block.querySelectorAll('.card-item');
    const leftButton = block.querySelector('.leftSlider');
    const rightButton = block.querySelector('.rightSlider');

    const updateButtons = () => {
      leftButton.classList.toggle('inactive', currentIndex === 0);
      rightButton.classList.toggle('inactive', currentIndex >= cardItems.length - 3);
    };

    const updateActiveClasses = () => {
      cardItems.forEach((card, index) => {
        card.classList.remove('active');
        if (index >= currentIndex && index < currentIndex + 3) {
          card.classList.add('active');
        }
      });
    };

    const moveSlider = (direction) => {
      const cardWidth = cardItems[0].offsetWidth;
      if (direction === 'left' && currentIndex > 0) {
        currentIndex--;
      } else if (direction === 'right' && currentIndex < cardItems.length - 3) {
        currentIndex++;
      }
      cardList.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      updateButtons();
      updateActiveClasses();
    };

    updateButtons();
    updateActiveClasses();

    leftButton.addEventListener('click', () => moveSlider('left'));
    rightButton.addEventListener('click', () => moveSlider('right'));
  }

  const cardCarousel = block.querySelectorAll('.card-carousel-image');
  cardCarousel.forEach((carouselItem) => {
    const imageList = carouselItem.querySelector('p');
    const images = imageList.querySelectorAll('picture');
    const indicatorsContainer = carouselItem.querySelector('.indicators');
    let currentCarouselIndex = 0;

    images.forEach((image, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator');
      if (index === 0) indicator.classList.add('active');
      indicator.dataset.index = index;
      indicatorsContainer.appendChild(indicator);
    });

    const updateCarousel = () => {
      const offset = -currentCarouselIndex * 100;
      imageList.style.transform = `translateX(${offset}%)`;
      carouselItem.querySelectorAll('.indicator').forEach((indicator) => {
        indicator.classList.remove('active');
      });
      indicatorsContainer.children[currentCarouselIndex].classList.add('active');
    };

    indicatorsContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('indicator')) {
        currentCarouselIndex = Number(event.target.dataset.index);
        updateCarousel();
      }
    });
  });
}
