(function () {
  'use strict';

  const STORAGE_KEY = 'saveslots_storage';
  const EXCLUDED = ["☁ open link", "☁ selected save slot", "☁ Was changing Save slots?"]; // ignore these cloud variables

  class SaveSlots {
    constructor () {
      this.slots = [{}, {}, {}, {}]; // 4 slot
      this._loadFromLocal();
    }

    _saveToLocal() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.slots));
      } catch (e) {
        console.warn("Impossibile salvare su localStorage", e);
      }
    }

    _loadFromLocal() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) this.slots = JSON.parse(raw);
      } catch (e) {
        console.warn("Impossibile leggere da localStorage", e);
      }
    }

    collect() {
      const vars = {};
      const runtime = Scratch.vm.runtime;
      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];
          if (v.isCloud && !EXCLUDED.includes(v.name)) {
            vars[v.name] = v.value;
          }
        }
      }
      return vars;
    }

    apply(data) {
      const runtime = Scratch.vm.runtime;
      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];
          if (v.isCloud && !EXCLUDED.includes(v.name) && data.hasOwnProperty(v.name)) {
            v.value = data[v.name];
          }
        }
      }
    }

    save(slot) {
      this.slots[slot - 1] = this.collect();
      this._saveToLocal();
    }

    load(slot) {
      this.apply(this.slots[slot - 1] || {});
    }

    toJSON(slot) {
      return JSON.stringify(this.slots[slot - 1] || {});
    }

    fromJSON(slot, json) {
      try {
        this.slots[slot - 1] = JSON.parse(json);
        this._saveToLocal();
      } catch (e) {
        console.error("JSON non valido", e);
      }
    }
  }

  const manager = new SaveSlots();

  class Extension {
    getInfo() {
      return {
        id: 'saveslots',
        name: 'Save Slots',
        blocks: [
          {
            opcode: 'save',
            blockType: Scratch.BlockType.COMMAND,
            text: 'salva slot [N]',
            arguments: {
              N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'load',
            blockType: Scratch.BlockType.COMMAND,
            text: 'carica slot [N]',
            arguments: {
              N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'toJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'JSON slot [N]',
            arguments: {
              N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'fromJSON',
            blockType: Scratch.BlockType.COMMAND,
            text: 'importa JSON [J] nello slot [N]',
            arguments: {
              J: { type: Scratch.ArgumentType.STRING, defaultValue: '{}' },
              N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          }
        ]
      };
    }

    save(args) {
      manager.save(args.N);
    }

    load(args) {
      manager.load(args.N);
    }

    toJSON(args) {
      return manager.toJSON(args.N);
    }

    fromJSON(args) {
      manager.fromJSON(args.N, args.J);
    }
  }

  Scratch.extensions.register(new Extension());
})();
