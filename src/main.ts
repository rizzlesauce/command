import * as Config from '@oclif/config'
import Help from '@oclif/plugin-help'

import {Command} from '.'

export class Main extends Command {
  static run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
    return super.run(argv, options || module.parent && module.parent.parent && module.parent.parent.filename || __dirname)
  }

  async init() {
    let [id, ...argv] = this.argv
    await this.config.runHook('init', {id, argv})
    return super.init()
  }

  async run() {
    if (this.argv.length === 0) return this._runDefaultCommand()
    let [id, ...argv] = this.argv
    this.parse({strict: false, '--': false, ...this.ctor as any})
    if (!this.config.findCommand(id)) {
      let topic = this.config.findTopic(id)
      if (topic) return this._help()
      return this._runDefaultCommand()
    }
    await this.config.runCommand(id, argv)
  }

  protected _getDefaultCommand(): string | undefined {
    const oclif = this.config.pjson.oclif as any
    return oclif.defaultCommand
  }

  protected async _runDefaultCommand() {
    const defaultCommandId = this._getDefaultCommand()
    if (defaultCommandId) {
      await this.config.runCommand(defaultCommandId, [...this.argv])
      return
    } else return this._help()
  }

  protected _helpOverride(): boolean {
    if (this.argv.length === 0) {
      if (this._getDefaultCommand()) return false
      return true
    }
    if (['-v', '-version', '--version', 'version'].includes(this.argv[0])) return this._version() as any
    if (['-h', '-help', '--help', 'help'].includes(this.argv[0])) return true
    return false
  }

  protected _help() {
    const HHelp: typeof Help = require('@oclif/plugin-help').default
    const help = new HHelp(this.config)
    help.showHelp(this.argv)
    return this.exit(0)
  }
}

export function run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
  return Main.run(argv, options)
}
