/**
 * Tracking interpolation
 */

import _ from 'lodash'
import { makeShape } from '../../../functional/states'
import { LabelType, ShapeType } from '../../../functional/types'

/**
 * Assign shape content from src to target and return the new shape
 * @param src
 * @param target
 */
function assignShape (src: ShapeType, target: ShapeType): ShapeType {
  const result = makeShape(src.shapeType, src, false)
  result.id = target.id
  result.shapeType = target.shapeType
  result.label = _.clone(target.label)
  return result
}

/**
 * Propagate shape to shapes
 * @param shape
 * @param shapes
 */
export function assignShapesInRange (
    start: number, end: number,
    shape: ShapeType[], shapes: ShapeType[][]) {
  for (let i = start; i < end; i += 1) {
    for (let j = 0; j < shapes[i].length; j += 1) {
      shapes[i][j] = assignShape(shape[j], shapes[i][j])
    }
  }
}

/**
 * Get the manual label before and after label in labels.
 * Assuming labels are sorted by item index.
 * @param targetLabel
 * @param labels
 */
export function getAutoLabelRange (
  targetLabel: LabelType, labels: LabelType[]
  ): [number, number, number] {
  const labelIndex = _.sortedIndexBy(labels, targetLabel, (l) => l.item)
  let prevIndex = -1
  for (let i = labelIndex - 1; i >= 0; i -= 1) {
    const label = labels[i]
    if (label.manual) {
      prevIndex = i
      break
    }
  }
  let nextIndex = -1
  for (let i = labelIndex + 1; i < labels.length; i += 1) {
    const label = labels[i]
    if (label.manual) {
      nextIndex = i
      break
    }
  }
  return [labelIndex, prevIndex, nextIndex]
}

/**
 * Base class for interpolation
 */
export class TrackInterp {
  /**
   * Main method for interpolation. It assumes labels are sorted by itemIndex
   * In the future, we may change this function to async for model-assisted
   * interpolation
   * @param newLabel
   * @param newShape
   * @param labels
   * @param shapes
   */
  public interp (
     newLabel: LabelType, newShape: ShapeType[],
     allLabels: LabelType[], allShapes: ShapeType[][]): ShapeType[][] {
    const [labelIndex, manual0, manual1] = getAutoLabelRange(
        newLabel, allLabels)
      // Copy the double array
    const newShapes = allShapes.map((shapes) => shapes.map((s) => s))
    newShapes[labelIndex] = newShape
    if (manual0 === -1) {
      assignShapesInRange(0, labelIndex, newShape, newShapes)
    } else {
      assignShapesInRange(manual0 + 1, labelIndex, newShape, newShapes)
    }
    if (manual1 === -1) {
      assignShapesInRange(labelIndex + 1, newShapes.length, newShape, newShapes)
    } else {
      assignShapesInRange(labelIndex + 1, manual1, newShape, newShapes)
    }
    return newShapes
  }
}
