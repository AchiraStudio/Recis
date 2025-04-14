document.addEventListener('DOMContentLoaded', function() {
    // Configuration with performance defaults
    const config = {
        jsonPath: '../assets/albums/christmas-charity/images.json',
        baseImagePath: '../assets/albums/christmas-charity/',
        contentClass: 'content',
        frameClass: 'frame',
        placeholderColor: '#f5f5f5',
        maxConcurrentLoads: 3, // Limit simultaneous image loads
        intersectionThreshold: 0.01, // When to start loading
        intersectionRootMargin: '500px' // Load images before they're visible
    };

    // Performance metrics
    const perf = {
        startTime: performance.now(),
        imagesLoaded: 0,
        totalImages: 0
    };

    // Create optimized Polaroid gallery
    function initGallery() {
        if (!('IntersectionObserver' in window)) {
            return loadGalleryWithoutIO(); // Fallback
        }

        const io = new IntersectionObserver(onIntersection, {
            threshold: config.intersectionThreshold,
            rootMargin: config.intersectionRootMargin
        });

        fetch(config.jsonPath)
            .then(handleResponse)
            .then(data => setupGallery(data.images, io))
            .catch(handleError);
    }

    // Handle fetch response with error checking
    async function handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        perf.totalImages = data.images.length;
        return data;
    }

    // Setup gallery with IntersectionObserver
    function setupGallery(images, observer) {
        const gallery = document.querySelector(`.${config.contentClass}`);
        if (!gallery) return;

        // Create document fragment for batch DOM insertion
        const fragment = document.createDocumentFragment();
        
        images.forEach((image, index) => {
            const polaroid = createPolaroid(image, index);
            fragment.appendChild(polaroid);
            
            // Observe images that need lazy loading
            const img = polaroid.querySelector('img');
            observer.observe(img);
        });

        gallery.appendChild(fragment);
        console.debug(`Gallery setup in ${performance.now() - perf.startTime}ms`);
    }

    // Create individual Polaroid element
    function createPolaroid(image, index) {
        const polaroid = document.createElement('div');
        polaroid.className = config.frameClass;
        
        // Set rotation and title
        const rotation = (Math.random() * 6) - 3;
        polaroid.style.setProperty('--rotation', `${rotation}deg`);
        polaroid.dataset.title = image.caption || image.alt || `Photo ${index + 1}`;

        // Image container
        const imgContainer = document.createElement('div');
        imgContainer.className = 'polaroid-img-container';
        
        // Image element with lazy loading attributes
        const img = new Image();
        img.className = 'polaroid-img lazy';
        img.alt = image.alt || `Polaroid photo ${index + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.fetchPriority = 'low';
        
        // Use data-src for lazy loading
        img.dataset.src = `${config.baseImagePath}${image.filename}`;
        img.style.backgroundColor = config.placeholderColor;
        
        // Error handling
        img.onerror = () => {
            img.src = getErrorSVG();
            img.classList.remove('lazy');
        };

        imgContainer.appendChild(img);
        polaroid.appendChild(imgContainer);
        
        return polaroid;
    }

    // IntersectionObserver callback
    function onIntersection(entries) {
        let loadingCount = 0;
        
        entries.forEach(entry => {
            if (loadingCount >= config.maxConcurrentLoads) return;
            
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    loadingCount++;
                    loadImage(img);
                }
            }
        });
    }

    // Controlled image loading
    function loadImage(img) {
        const src = img.dataset.src;
        delete img.dataset.src;
        
        const loader = new Image();
        loader.src = src;
        loader.onload = () => {
            img.src = src;
            img.classList.remove('lazy');
            perf.imagesLoaded++;
            
            // Log performance when all images are loaded
            if (perf.imagesLoaded === perf.totalImages) {
                console.debug(`All images loaded in ${performance.now() - perf.startTime}ms`);
            }
        };
        loader.onerror = () => {
            img.src = getErrorSVG();
            img.classList.remove('lazy');
        };
    }

    // Fallback for browsers without IntersectionObserver
    function loadGalleryWithoutIO() {
        fetch(config.jsonPath)
            .then(handleResponse)
            .then(data => {
                const gallery = document.querySelector(`.${config.contentClass}`);
                if (!gallery) return;
                
                const fragment = document.createDocumentFragment();
                data.images.forEach((image, index) => {
                    const polaroid = createPolaroid(image, index);
                    const img = polaroid.querySelector('img');
                    img.src = img.dataset.src; // Load immediately
                    delete img.dataset.src;
                    fragment.appendChild(polaroid);
                });
                
                gallery.appendChild(fragment);
            })
            .catch(handleError);
    }

    // Error SVG generator
    function getErrorSVG() {
        return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23ccc"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif">Photo missing</text></svg>';
    }

    // Error handling
    function handleError(error) {
        console.error('Gallery error:', error);
        showErrorMessage();
    }

    // Error message display
    function showErrorMessage() {
        const gallery = document.querySelector(`.${config.contentClass}`);
        if (gallery) {
            gallery.innerHTML = `
                <div class="polaroid-error">
                    <p>📸 Couldn't load the photo gallery</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            `;
        }
    }

    // Start the gallery initialization
    initGallery();
});