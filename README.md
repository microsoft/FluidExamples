# Welcome to the Fluid Framework Examples Repository!

This codebase includes examples of collaborative applications built with the Fluid Framework.
For documentation about the Fluid Framework, go to [FluidFramework.com](https://fluidframework.com/).
The Fluid Framework repository lives at [Github.com/Microsoft/FluidFramework](https://github.com/microsoft/fluidframework).

Each example in this repository is a standalone application that defines a Fluid Container and loads it into a webpage.

| Example | Focus |
| --- | --- |
| [Canvas](canvas/README.md) | Collaborative shapes, notes, tables, ink, comments, voting, undo/redo, and Presence. |
| [Brainstorm](brainstorm/README.md) | Recursive SharedTree schemas for notes and groups. |
| [Item counter](item-counter/README.md) | A minimal SharedTree application using Azure Fluid Relay. |
| [SharePoint counter](item-counter-spe/README.md) | SharedTree with SharePoint Embedded and Entra authentication. |

## Getting Started

Use Node.js 22.22.2 or newer. The examples use Fluid Framework 3.5.
Clone the repository and navigate to an example folder; each example has its own dependencies and lockfile.

1. Run `npm ci` from the example root.
2. For local Azure Fluid Relay examples, run `npm run start:server`.
3. In a second terminal in the same folder, run `npm run dev:local`.

Open http://localhost:8080 and share the document URL with another browser window.
Cloud services require additional configuration; see the individual READMEs.
Canvas's modernized table schema uses new documents, not documents from the old experimental Canvas branch.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
