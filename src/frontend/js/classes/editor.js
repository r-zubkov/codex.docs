import EditorJS from '@editorjs/editorjs';
import FrontendConfig from '../../../../frontend-config';

/**
 * Plugins
 */
 import Undo from 'editorjs-undo';
 import DragDrop from 'editorjs-drag-drop';

/**
 * Block Tools for the Editor
 */
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import CodeTool from '@editorjs/code';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import Warning from '@editorjs/warning';
import Checklist from '@editorjs/checklist';
import LinkTool from '@editorjs/link';
import RawTool from '@editorjs/raw';
import Embed from '@editorjs/embed';
import ToggleBlock from 'editorjs-toggle-block';

/**
 * Inline Tools for the Editor
 */
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Superscript from 'editorjs-superscript';

/**
 * Class for working with Editor.js
 */
export default class Editor {
  /**
   * Creates Editor instance
   *
   * @param {object} editorConfig - configuration object for Editor.js
   * @param {object} data.blocks - data to start with
   * @param {object} options
   * @param {string} options.headerPlaceholder - placeholder for Header tool
   */
  constructor(editorConfig = {}, options = {}) {
    const defaultConfig = {
      onReady: () => this.handleReady(),
      tools: {
        header: {
          class: Header,
          inlineToolbar: ['marker', 'superscript', 'inlineCode'],
          config: {
            placeholder: options.headerPlaceholder || '',
          },
        },

        image: {
          class: Image,
          inlineToolbar: true,
          config: {
            types: 'image/*, video/mp4',
            endpoints: {
              byFile: `${FrontendConfig.basePath}/api/transport/image`,
              byUrl: `${FrontendConfig.basePath}/api/transport/fetch`,
            },
          },
        },

        linkTool: {
          class: LinkTool,
          config: {
            endpoint: `${FrontendConfig.basePath}/api/fetchUrl`,
          },
        },

        code: {
          class: CodeTool,
          shortcut: 'CMD+SHIFT+D',
        },

        list: {
          class: List,
          inlineToolbar: true,
        },

        quote: {
          class: Quote,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+O',
          config: {
            quotePlaceholder: 'Text',
            captionPlaceholder: 'Caption',
          },
        },

        table: {
          class: Table,
          inlineToolbar: true,
        },

        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },

        toggle: {
          class: ToggleBlock,
          inlineToolbar: true,
        },

        delimiter: Delimiter,

        warning: {
          class: Warning,
          inlineToolbar: true,
        },

        /**
         * Inline Tools
         */
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C',
        },

        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M',
        },

        superscript: {
          class: Superscript
        },

        raw: RawTool,

        embed: Embed,
      },
      data: {
        blocks: [
          {
            type: 'header',
            data: {
              text: '',
              level: 2,
            },
          },
        ],
      },
    };

    this.editor = new EditorJS(Object.assign(defaultConfig, editorConfig));
  }

  /**
   * Init plugins on ready state
   */
  handleReady() {
    const editor = this.editor
    new Undo({ editor });
    new DragDrop(editor);
  };

  /**
   * Return Editor data
   *
   * @returns {Promise.<{}>}
   */
  save() {
    return this.editor.saver.save();
  }
}
