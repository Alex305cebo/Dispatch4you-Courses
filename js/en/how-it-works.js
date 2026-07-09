// Professional Timeline with Progress Bar
(function () {
  const nodes = document.querySelectorAll('.timeline-node');
  const progress = document.getElementById('timelineProgress');
  if (!nodes.length || !progress) return;

  let current = 0;
  const isMobile = window.innerWidth <= 768;

  function updateTimeline() {
    if (isMobile) {
      // На мобильных не меняем активность автоматически
      progress.style.height = (current / (nodes.length - 1)) * 100 + '%';
      progress.style.width = '100%';
    } else {
      // На десктопе тоже только по клику
      progress.style.width = (current / (nodes.length - 1)) * 100 + '%';
      progress.style.height = '100%';
    }
  }

  nodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      // На всех устройствах переключаем активность при клике
      node.classList.toggle('active');
    });
  });

  updateTimeline();
})();

// Animate circle text (number <-> "Нажми")
(function () {
  let currentHintIndex = 0; // Начинаем с первого раздела
  let hintTimeout = null;
  let isHintVisible = false;

  function showHintOnNode(index) {
    const nodes = document.querySelectorAll('.timeline-node');

    // Убираем hint со всех узлов
    nodes.forEach(node => {
      const circle = node.querySelector('.node-circle');
      const span = node.querySelector('.node-circle span');
      if (span && circle) {
        span.classList.remove('show-hint');
        circle.classList.remove('show-hint');
      }
    });

    // Показываем hint только на указанном узле
    if (index < nodes.length) {
      const targetNode = nodes[index];
      const circle = targetNode.querySelector('.node-circle');
      const span = targetNode.querySelector('.node-circle span');
      if (span && circle) {
        setTimeout(() => {
          span.classList.add('show-hint');
          circle.classList.add('show-hint');
          isHintVisible = true;
        }, 50);
      }
    }
  }

  function hideHint() {
    const nodes = document.querySelectorAll('.timeline-node');
    nodes.forEach(node => {
      const circle = node.querySelector('.node-circle');
      const span = node.querySelector('.node-circle span');
      if (span && circle) {
        span.classList.remove('show-hint');
        circle.classList.remove('show-hint');
      }
    });
    isHintVisible = false;
  }

  function scheduleNextHint() {
    // Очищаем предыдущий таймаут
    if (hintTimeout) {
      clearTimeout(hintTimeout);
    }

    const nodes = document.querySelectorAll('.timeline-node');

    if (isHintVisible) {
      // Если hint видим, скрываем его и планируем следующий
      hideHint();

      // Задержка перед следующим показом - 20 секунд
      hintTimeout = setTimeout(() => {
        // Переходим к следующему разделу
        currentHintIndex = (currentHintIndex + 1) % nodes.length;
        showHintOnNode(currentHintIndex);

        // Планируем скрытие через 2 секунды
        hintTimeout = setTimeout(scheduleNextHint, 2000);
      }, 20000);
    } else {
      // Если hint скрыт, показываем его
      showHintOnNode(currentHintIndex);

      // Планируем скрытие через 2 секунды
      hintTimeout = setTimeout(scheduleNextHint, 2000);
    }
  }

  // Слушаем клики на узлах
  const nodes = document.querySelectorAll('.timeline-node');
  nodes.forEach((node, index) => {
    node.addEventListener('click', () => {
      // При клике на любой узел, показываем hint на нём
      currentHintIndex = index;
      hideHint();
      showHintOnNode(currentHintIndex);

      // Перезапускаем цикл
      if (hintTimeout) {
        clearTimeout(hintTimeout);
      }
      hintTimeout = setTimeout(scheduleNextHint, 2000);
    });
  });

  // Показываем hint на первом узле и запускаем цикл через 5 секунд
  setTimeout(() => {
    showHintOnNode(currentHintIndex);
    hintTimeout = setTimeout(scheduleNextHint, 2000);
  }, 5000);
})();
