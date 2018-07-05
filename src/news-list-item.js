/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-flex-layout/iron-flex-layout.js';
import './news-img.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

class NewsListItem extends PolymerElement {
  static get template() {
    return html`
    <style>

      :host {
        display: block;
      }

      a {
        display: block;
        position: relative;
        text-decoration: none;
        color: inherit;
        overflow: hidden;
      }

      news-img {
        height: 150px;
      }

      h2 {
        margin: 18px 0;
        font-weight: 400;
        font-size: 20px;
        line-height: 28px;
      }

      .category {
        padding: 6px 20px 7px;
        border: var(--app-border-style);
        display: inline-block;
        font-weight: bold;
        font-size: 11px;
      }

      .category[hidden] {
        visibility: hidden;
        height: 0px;
        margin-top: 0px;
        padding: 0px;
      }

      .details {
        @apply --layout-horizontal;
        font-size: 11px;
        font-weight: bold;
      }

      .time-ago {
        white-space: nowrap;
      }

      .author {
        padding-left: 35px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* mobile */
      @media (max-width: 767px) {
        news-img {
          display: none;
        }
      }

      /* desktop */
      @media (min-width: 768px) {
        :host([horizontal]) {
          margin-bottom: 24px;
        }

        .category {
          margin-top: 20px;
        }
      }

      /* desktop large */
      @media (min-width: 1310px) {
        :host([horizontal]) a {
          @apply --layout-horizontal;
        }

        :host([horizontal]) news-img {
          min-width: 150px;
          margin-right: 24px;
        }

        :host([horizontal]) .category {
          display: none;
        }
      }

    </style>

    <a href\$="[[item.href]]">
      <news-img src="[[item.imageUrl]]" alt="[[item.headline]]"></news-img>
      <div class="headline">
        <div class="category" hidden\$="[[!item.category]]">[[item.category]]</div>
        <h2>[[item.headline]]</h2>
        <div class="details">
          <div class="time-ago">[[item.timeAgo]]</div>
          <div class="author">[[item.author]]</div>
        </div>
      </div>
    </a>
`;
  }

  static get is() { return 'news-list-item'; }

  static get properties() { return {

    item: {
      type: Object
    }

  }}
}

customElements.define(NewsListItem.is, NewsListItem);
