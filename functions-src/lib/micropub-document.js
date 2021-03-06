import dateformat from 'dateformat';
import matter from 'gray-matter';
import _ from 'lodash';
import slugify from 'slugify';

const MAX_SLUG_LENGTH = 10;
const VALID_KEYS = ['name', 'mp-slug', 'category', 'location', 'in-reply-to', 'repost-of', 'syndication', 'mp-syndicate-to', 'bookmark-of', 'published'];
const KEY_TRANSLATION = {
  note: {
    category: 'tags',
    name: 'title'
  },
  post: {
    name: 'title'
  }
}

export default class MicropubDocument {
  constructor(object) {
    this.rawObject = object;
    this.content = object.content || '';
    this.type = 'note';
    this.createdAt = new Date();
    this.setupFrontmatter();
  }

  setupFrontmatter() {
    this.frontmatter = _.chain(this.rawObject)
                        .pick(VALID_KEYS)
                        .pickBy(_.identity)
                        .mapKeys((value, key) => KEY_TRANSLATION[this.type][key] || key)
                        .value();
    this.frontmatter.date = dateformat(this.createdAt,'yyyy-mm-dd HH:MM:ss');
  }

  async toYAML() {
    return matter.stringify(this.content, this.frontmatter);
  }

  path() {
    return `_${this.type}s/${dateformat(this.createdAt,'yyyy-mm-dd')}-${this.slug()}.md`;
  }

  slug() {
    let slug = this.frontmatter['mp-slug'] || this.frontmatter.title || this.content.split('\n')[0];
    slug = slugify(slug, {remove: /[*+~.,()'"!:@]/g}).toLowerCase();
    let slugArray = slug.split('-');
    let trimmedSlug = _.take(slugArray, MAX_SLUG_LENGTH).join('-');

    return trimmedSlug;
  }
}
