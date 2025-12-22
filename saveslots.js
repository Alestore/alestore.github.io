(function () {
  'use strict';

  const EXCLUDED = ["☁ open link", "☁ selected save slot", "☁ Was changing Save slots?"]; // ignore these cloud variables
  const CLOUD_SLOTS = ["☁ slot 1", "☁ slot 2", "☁ slot 3", "☁ slot 4"]; // le variabili cloud dedicate agli slot

  class SaveSlotsCloud {

    collect() {
      const vars = {};
      const runtime = Scratch.vm.runtime;
      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];
          if (v.isCloud && !EXCLUDED.includes(v.name) && !CLOUD_SLOTS.includes(v.name)) {
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
          if (v.isCloud && !EXCLUDED.includes(v.name) && !CLOUD_SLOTS.includes(v.name) && data.hasOwnProperty(v.name)) {
            v.value = data[v.name];
          }
        }
      }
    }

    save(slot) {
      if (slot < 1 || slot > CLOUD_SLOTS.length) {
        console.warn(`Slot ${slot} non valido. Valori consentiti: 1-${CLOUD_SLOTS.length}`);
        return;
      }
      const json = JSON.stringify(this.collect());
      const cloudVarName = CLOUD_SLOTS[slot - 1];
      const runtime = Scratch.vm.runtime;

      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];
          if (v.isCloud && v.name === cloudVarName) {
            v.value = json;
            return;
          }
        }
      }
      console.warn(`Variabile cloud ${cloudVarName} non trovata`);
    }

    load(slot) {
      if (slot < 1 || slot > CLOUD_SLOTS.length) {
        console.warn(`Slot ${slot} non valido. Valori consentiti: 1-${CLOUD_SLOTS.length}`);
        return;
      }
      const cloudVarName = CLOUD_SLOTS[slot - 1];
      const runtime = Scratch.vm.runtime;
      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];
          if (v.isCloud && v.name === cloudVarName) {
            try {
              const data = JSON.parse(v.value || '{}');
              this.apply(data);
            } catch (e) {
              console.error("JSON dello slot non valido", e);
            }
            return;
          }
        }
      }
      console.warn(`Variabile cloud ${cloudVarName} non trovata`);
    }

    toJSON(slot) {
      if (slot < 1 || slot > CLOUD_SLOTS.length) return '{}';
      const cloudVarName = CLOUD_SLOTS[slot - 1];
      const runtime = Scratch.vm.runtime;
      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];
          if (v.isCloud && v.name === cloudVarName) {
            return v.value || '{}';
          }
        }
      }
      return '{}';
    }

    fromJSON(slot, json) {
      if (slot < 1 || slot > CLOUD_SLOTS.length) return;
      const cloudVarName = CLOUD_SLOTS[slot - 1];
      const runtime = Scratch.vm.runtime;
      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];
          if (v.isCloud && v.name === cloudVarName) {
            v.value = json;
            try {
              const data = JSON.parse(json);
              this.apply(data);
            } catch (e) {
              console.error("JSON non valido nello slot", e);
            }
            return;
          }
        }
      }
    }
  }

  const manager = new SaveSlotsCloud();

  class Extension {
    getInfo() {
      return {
        id: 'saveslots', // stesso ID della vecchia estensione
        name: 'Save Slots',
        blocks: [
          {
            opcode: 'save',
            blockType: Scratch.BlockType.COMMAND,
            text: 'salva slot [N]',
            arguments: { N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
          },
          {
            opcode: 'load',
            blockType: Scratch.BlockType.COMMAND,
            text: 'carica slot [N]',
            arguments: { N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
          },
          {
            opcode: 'toJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'JSON slot [N]',
            arguments: { N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
          },
          {
            opcode: 'fromJSON',
            blockType: Scratch.BlockType.COMMAND,
            text: 'importa JSON [J] nello slot [N]',
            arguments: { J: { type: Scratch.ArgumentType.STRING, defaultValue: '{}' }, N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
          }
        ]
      };
    }

    save(args) { manager.save(args.N); }
    load(args) { manager.load(args.N); }
    toJSON(args) { return manager.toJSON(args.N); }
    fromJSON(args) { manager.fromJSON(args.N, args.J); }
  }

  Scratch.extensions.register(new Extension());
})();
