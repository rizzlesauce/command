import * as Config from '@rizzlesauce/oclif-config'
import Help from '@rizzlesauce/oclif-plugin-help'

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
    if (this.argv.length === 0) {
      if (this._defaultCommandId) return this._runDefaultCommand()
      return this._help()
    }
    let [id, ...argv] = this.argv
    this.parse({strict: false, '--': false, ...this.ctor as any})
    if (!this.config.findCommand(id)) {
      let topic = this.config.findTopic(id)
      if (topic) return this._help()
      if (this._defaultCommandId) return this._runDefaultCommand()
    }
    await this.config.runCommand(id, argv)
  }

  protected _runDefaultCommand() {
    return this.config.runCommand(this._defaultCommandId || '', [...this.argv], {isBeingRunByDefault: true})
  }

  protected get _helpAliases() {
    const helpAlias = ['-h', '-help', '--help']
    if (this._helpCommandId) {
      helpAlias.push(this._helpCommandId)
    }
    return helpAlias
  }

  protected get _versionAliases() {
    const versionAlias = ['-v', '-version', '--version']
    if (this._versionCommandId) {
      versionAlias.push(this._versionCommandId)
    }
    return versionAlias
  }

  protected _helpOverride(): boolean {
    if (this.argv.length === 0) {
      return !this._defaultCommandId
    }
    if (this._versionAliases.includes(this.argv[0])) return this._version() as any
    if (this._helpAliases.includes(this.argv[0])) return true
    return false
  }

  protected _help() {
    const HHelp: typeof Help = require('@rizzlesauce/oclif-plugin-help').default
    // TODO: casting to any is a workaround until changes to IConfig are propogated to Help plugin
    const help = new HHelp(this.config as any)
    help.showHelp(this.argv)
    return this.exit(0)
  }
}

export function run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
  return Main.run(argv, options)
}
