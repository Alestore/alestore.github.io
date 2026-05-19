(function () {
  'use strict';

  const EXCLUDED = [
    "☁ open link",
    "☁ selected save slot",
    "☁ Was changing Save slots?",

    "☁ slot_1_valid",
    "☁ slot_2_valid",
    "☁ slot_3_valid",
    "☁ slot_4_valid",

    "☁ slot_1_version",
    "☁ slot_2_version",
    "☁ slot_3_version",
    "☁ slot_4_version"
  ];

  const CLOUD_SLOTS = [
    "☁ slot 1",
    "☁ slot 2",
    "☁ slot 3",
    "☁ slot 4"
  ];

  const VALID_FLAGS = [
    "☁ slot_1_valid",
    "☁ slot_2_valid",
    "☁ slot_3_valid",
    "☁ slot_4_valid"
  ];

  const VERSION_FLAGS = [
    "☁ slot_1_version",
    "☁ slot_2_version",
    "☁ slot_3_version",
    "☁ slot_4_version"
  ];

  class SaveSlotsCloud {

    getCloudVar(name) {
      const runtime = Scratch.vm.runtime;

      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];

          if (v.isCloud && v.name === name) {
            return v;
          }
        }
      }

      return null;
    }

    collect() {
      const vars = {};
      const runtime = Scratch.vm.runtime;

      for (const target of runtime.targets) {
        for (const id in target.variables) {
          const v = target.variables[id];

          if (
            v.isCloud &&
            !EXCLUDED.includes(v.name) &&
            !CLOUD_SLOTS.includes(v.name)
          ) {
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

          if (
            v.isCloud &&
            !EXCLUDED.includes(v.name) &&
            !CLOUD_SLOTS.includes(v.name) &&
            Object.prototype.hasOwnProperty.call(data, v.name)
          ) {
            v.value = data[v.name];
          }
        }
      }
    }

    save(slot) {

      slot = Number(slot);

      if (slot < 1 || slot > CLOUD_SLOTS.length) {
        console.warn("Slot non valido");
        return;
      }

      const slotVar = this.getCloudVar(CLOUD_SLOTS[slot - 1]);
      const validVar = this.getCloudVar(VALID_FLAGS[slot - 1]);
      const versionVar = this.getCloudVar(VERSION_FLAGS[slot - 1]);

      if (!slotVar || !validVar || !versionVar) {
        console.warn("Variabili cloud mancanti");
        return;
      }

      try {

        // invalida lo slot PRIMA
        validVar.value = 0;

        // raccogli dati
        const data = this.collect();

        // nuova versione
        const newVersion =
          parseInt(versionVar.value || "0", 10) + 1;

        // payload completo
        const payload = {
          version: newVersion,
          timestamp: Date.now(),
          data: data
        };

        const json = JSON.stringify(payload);

        // sanity check
        JSON.parse(json);

        // scrivi JSON
        slotVar.value = json;

        // aggiorna versione
        versionVar.value = String(newVersion);

        // SOLO ORA valida
        validVar.value = 1;

      } catch (e) {
        console.error("Errore salvataggio:", e);

        // se qualcosa va male
        validVar.value = 0;
      }
    }

    load(slot) {

      slot = Number(slot);

      if (slot < 1 || slot > CLOUD_SLOTS.length) {
        console.warn("Slot non valido");
        return;
      }

      const slotVar = this.getCloudVar(CLOUD_SLOTS[slot - 1]);
      const validVar = this.getCloudVar(VALID_FLAGS[slot - 1]);

      if (!slotVar || !validVar) {
        console.warn("Variabili cloud mancanti");
        return;
      }

      // NON caricare slot invalidi
      if (String(validVar.value) !== "1") {
        console.warn("Slot non valido");
        return;
      }

      try {

        const raw = slotVar.value || "{}";

        const parsed = JSON.parse(raw);

        if (
          !parsed ||
          typeof parsed !== "object" ||
          !parsed.data
        ) {
          console.warn("Save malformato");
          return;
        }

        this.apply(parsed.data);

      } catch (e) {
        console.error("Errore caricamento:", e);
      }
    }

    toJSON(slot) {

      slot = Number(slot);

      if (slot < 1 || slot > CLOUD_SLOTS.length) {
        return "{}";
      }

      const slotVar = this.getCloudVar(CLOUD_SLOTS[slot - 1]);

      if (!slotVar) {
        return "{}";
      }

      return slotVar.value || "{}";
    }

    fromJSON(slot, json) {

      slot = Number(slot);

      if (slot < 1 || slot > CLOUD_SLOTS.length) {
        return;
      }

      const slotVar = this.getCloudVar(CLOUD_SLOTS[slot - 1]);
      const validVar = this.getCloudVar(VALID_FLAGS[slot - 1]);

      if (!slotVar || !validVar) {
        return;
      }

      try {

        // verifica JSON valido
        JSON.parse(json);

        validVar.value = 0;

        slotVar.value = json;

        validVar.value = 1;

      } catch (e) {
        console.error("JSON non valido:", e);

        validVar.value = 0;
      }
    }
  }

  const manager = new SaveSlotsCloud();

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
              N: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },

          {
            opcode: 'load',
            blockType: Scratch.BlockType.COMMAND,
            text: 'carica slot [N]',
            arguments: {
              N: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },

          {
            opcode: 'toJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'JSON slot [N]',
            arguments: {
              N: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },

          {
            opcode: 'fromJSON',
            blockType: Scratch.BlockType.COMMAND,
            text: 'importa JSON [J] nello slot [N]',
            arguments: {
              J: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '{}'
              },

              N: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
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
