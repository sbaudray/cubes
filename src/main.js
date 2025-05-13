import { Mongo } from "meteor/mongo";
import { Template } from "meteor/templating";

const CubesCollection = new Mongo.Collection("cubes");

function randomRGB() {
  return { r: Math.random(), g: Math.random(), b: Math.random() };
}

function findAdjacentCubesIds(existingCube, adjacentCubesIds) {
  for (const delta of [
    [-1, 0],
    [+1, 0],
    [0, +1],
    [0, -1],
  ]) {
    const adjacentCube = CubesCollection.findOne({
      x: existingCube.x + delta[0],
      y: existingCube.y + delta[1],
    });

    if (adjacentCube) {
      if (!adjacentCubesIds.has(adjacentCube._id)) {
        adjacentCubesIds.add(adjacentCube._id);
        findAdjacentCubesIds(adjacentCube, adjacentCubesIds);
      }
    }
  }

  return adjacentCubesIds;
}

if (Meteor.isClient) {
  Template.world.helpers({
    cubes() {
      return CubesCollection.find({});
    },
  });

  Template.world.events({
    "mouseup #scene"(event) {
      const { worldX, worldY } = event;

      const existingCube = CubesCollection.findOne({
        x: Math.round(worldX),
        y: Math.round(worldY),
      });

      if (existingCube) {
        const adjacentCubesIds = findAdjacentCubesIds(existingCube, new Set());

        const newColor = randomRGB();

        for (const id of Array.from(adjacentCubesIds)) {
          CubesCollection.update({ _id: id }, { $set: { colorRGB: newColor } });
        }
      } else {
        CubesCollection.insert({
          x: Math.round(worldX),
          y: Math.round(worldY),
          colorRGB: randomRGB(),
        });
      }
    },
  });
}

if (Meteor.isServer) {
}
