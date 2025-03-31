export const processSvgForWebflow = async (
  svgCode: string,
  options = { fillsUseCurrentColor: false, strokesUseCurrentColor: true }
) => {
  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgCode, "image/svg+xml");

    const parserError = svgDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Invalid SVG format");
    }

    const svgElement = svgDoc.querySelector("svg");
    if (!svgElement) {
      throw new Error("No SVG element found in the provided code");
    }

    const selectedElement = await webflow.getSelectedElement();
    if (!selectedElement?.children) {
      throw new Error("No valid element selected that can contain children");
    }

    const rootElement = webflow.elementBuilder(webflow.elementPresets.DOM);
    rootElement.setTag("svg");

    Array.from(svgElement.attributes).forEach((attr) => {
      let value = attr.value;

      if (
        (attr.name === "fill" && options.fillsUseCurrentColor) ||
        (attr.name === "stroke" && options.strokesUseCurrentColor)
      ) {
        value = "currentColor";
      }

      rootElement.setAttribute(attr.name, value);
    });

    rootElement.setAttribute("fill", "none");

    processChildNodes(svgElement, rootElement, options);

    await selectedElement.prepend(rootElement);

    await webflow.notify({
      type: "Success",
      message: "SVG successfully added to your element!",
    });
    const defsElements = svgElement.querySelectorAll("defs");
    console.log("defsElements", defsElements);
    if (defsElements && defsElements.length > 0) {
      await webflow.notify({
        type: "Info",
        message:
          "A <defs> element was found in the SVG code: filters, gradients, shadows... will only be rendered on the published site.",
      });
    }
  } catch (error) {
    let errorMessage = "An error occurred while processing the SVG";

    if (error instanceof Error) {
      const errorText = error.message;

      if (errorText.includes("No SVG element found")) {
        errorMessage =
          "No SVG element found in the provided code. Please check your SVG.";
      } else if (errorText.includes("No valid element selected")) {
        errorMessage = "Please select an element that can contain children.";
      } else if (errorText.includes("Invalid SVG format")) {
        errorMessage =
          "The provided code is not a valid SVG. Please check your code.";
      }
    }

    await webflow.notify({
      type: "Error",
      message: errorMessage,
    });
  }
};

const processChildNodes = (
  sourceNode: Element,
  targetElement: any,
  options: { fillsUseCurrentColor: boolean; strokesUseCurrentColor: boolean }
) => {
  Array.from(sourceNode.children).forEach((childNode) => {
    if (childNode.nodeType === 1) {
      const childElement = targetElement.append(webflow.elementPresets.DOM);

      childElement.setTag(childNode.tagName.toLowerCase());

      Array.from(childNode.attributes).forEach((attr) => {
        let value = attr.value;

        if (
          (attr.name === "fill" && options.fillsUseCurrentColor) ||
          (attr.name === "stroke" && options.strokesUseCurrentColor)
        ) {
          value = "currentColor";
        }

        childElement.setAttribute(attr.name, value);
      });

      if (childNode.children.length === 0 && childNode.textContent?.trim()) {
        childElement.setTextContent(childNode.textContent);
      }

      processChildNodes(childNode, childElement, options);
    }
  });
};
