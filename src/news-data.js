/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { PolymerElement } from "../node_modules/@polymer/polymer/polymer-element.js";
let textarea = document.createElement('textarea');

class NewsData extends PolymerElement {
  static get is() {
    return 'news-data';
  }

  static get properties() {
    return {
      route: Object,
      categories: {
        type: Array,
        notify: true
      },
      category: {
        type: Object,
        notify: true
      },
      categoryName: String,
      article: {
        type: Object,
        notify: true
      },
      articleId: String,
      offline: Boolean,
      loading: {
        type: Boolean,
        readOnly: true,
        notify: true
      },
      failure: {
        type: Boolean,
        readOnly: true,
        notify: true
      }
    };
  }

  static get observers() {
    return [
      '_routePath(route)',
      '_computeCategory(categories, categoryName)',
      '_computeArticle(articleId)',
      '_fetchCategory(category, offline)', 
      '_fetchArticle(article, offline)'
    ];
  }

  connectedCallback(){    
    database.ref('categories').on('value', snapshot => {
      let items = [];

      snapshot.forEach( category => {
        items.push( category.val().metadata );
      });

      this.set('categories', items);
    });
  }

  _routePath(route) {
    let path = route.path.split('/').slice(1);
    
    switch ( path[0] ) {
      case 'categoria':
        this.set('categoryName', path[1]);
        break;

      default:
        this.set('articleId', path[0]);
        break;
    }
  }

  _computeCategory(categories, categoryName) {
    if (!categories || !categoryName) {
      return;
    }

    this.categories.forEach( c => {
      if (c.name === categoryName) {
        this.set('category', c);
        return;
      }
    });
  }

  _fetchCategory(category, offline) {
    // Don't fail if we become offline but already have a cached version, or if there's
    // nothing to fetch, or if already loading.
    if (offline && category && category.items || !category || this.loading) {
      this._setFailure(false);

      return;
    }

    new Promise( (resolve, reject) => {
      
      database.ref('categories').child(category.name).child('items').once('value', snapshot => {
        
        let posts = [];

        snapshot.forEach( child => {

            database.ref('posts').child(child.key).once('value').then( postSnap => {

              let post = postSnap.val();
              posts.push( this._parseCategoryItems(post) );

              if (posts.length === snapshot.numChildren()) {
                resolve(posts);
              }
            });

        });

      });

    }).then( posts => {
      this._setLoading(false);
      this.set('category.items', posts);
    });

  }

  _computeArticle(articleId) {
    if (!articleId) {
      return;
    }

    database.ref('posts').child(articleId).once('value').then( item => {
      return item.val();
    }).then( post => {
      this.set('categoryName', post.category_slug );
      this.set('article', this._parseCategoryItems( post ) );
    });
  }
  
  _fetchArticle(article, offline) {
    // Don't fail if we become offline but already have a cached version, or if there's
    // nothing to fetch, or if already loading.
    if (offline && article && article.html || !article || this.loading) {
      this._setFailure(false);

      return;
    }

    this._setLoading(false);
    this.set('article.html', article.content);
  }
  
  _parseCategoryItems(item) {
    return {
        headline: this._unescapeText(item.title),
        href: encodeURIComponent(item.id),
        id: item.id,
        content: this._formatHTML(item.content),
        imageUrl: item.featured_image,
        placeholder: item.featured_image,
        category: item.category_name,
        timeAgo: this._timeAgo(new Date(item.time).getTime()),
        author: item.author,
        summary: this._trimRight(item.summary, 100),
        readTime: Math.max(2, Math.round(item.contentLength / 3000)) + ' min'
      }
  }

  _unescapeText(text) {
    textarea.innerHTML = text;
    return textarea.textContent;
  }

  _timeAgo(timestamp) {
    if (!timestamp) return '';
    let minutes = (Date.now() - timestamp) / 1000 / 60;
    if (minutes < 2) return '1 min ago';
    if (minutes < 60) return Math.floor(minutes) + ' mins ago';
    if (minutes < 120) return '1 hour ago';
    let hours = minutes / 60;
    if (hours < 24) return Math.floor(hours) + ' hours ago';
    if (hours < 48) return '1 day ago';
    return Math.floor(hours / 24) + ' days ago';
  }

  _trimRight(text, maxLength) {
    let breakIdx = text.indexOf(' ', maxLength);
    return breakIdx === -1 ? text : text.substr(0, breakIdx) + '...';
  }

  _formatHTML(html) {
    let template = document.createElement('template');
    template.innerHTML = html; // Remove h1, .kicker, and .date from content.
    // let h1 = template.content.querySelector('h1');
    // h1 && h1.remove();
    // let kicker = template.content.querySelector('.kicker');
    // kicker && kicker.remove();
    // let date = template.content.querySelector('.date');
    // date && date.remove();
    // Remove the first image if it's the same as the item image.
    // let image = template.content.querySelector('img');
    // if (image && this._isSameImageSrc(image.src, this.article.imageUrl)) {
    //   image.remove();
    // }
    // Remove width/height attributes from all images.

    let images = template.querySelectorAll('img');

    for (let i = 0; i < images.length; ++i) {
      let img = images[i];
      img.removeAttribute('width');
      img.removeAttribute('height');
    }

    return template.innerHTML;
  }

  refresh() {
    if (this.categoryName) {
      // Try at most 3 times to get the items.
      this._fetchCategory(this.category, this.offline);
    }
  }

}

customElements.define(NewsData.is, NewsData);