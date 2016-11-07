# hyperlog-doctor

> cli tool for checking and repairing
> [hyperlogs](https://github.com/mafintosh/hyperlog)

This command line tool is the result of deep bug hunts into the hyperlog source.
I figured it'd be nice for future hyperlog users to have a nice little tool for
detecting some of the types of data corruption and repairing them.

## Usage

```
USAGE
  hyperlog-doctor - lint and repair hyperlogs

SUBCOMMANDS
  hyperlog-doctor lint <LEVELDB>
    Run various sanity checks on a hyperlog's LevelDB directory. A report will
    be written to standard out.

  hyperlog-doctor repair <LEVELDB>
    Examine the LevelDB directory given and regenerate its HEADS and CHANGES
    indexes.
```

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install -g hyperlog-doctor
```

## Acknowledgments

hyperlog-doctor was sponsored by [Digital
Democracy](https://www.digital-democracy.org).

## License

ISC

