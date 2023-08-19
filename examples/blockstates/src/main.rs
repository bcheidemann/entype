#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct ArrayElement5 {
    model: String,
    uvlock: Option<bool>,
    weight: Option<f64>,
    x: Option<f64>,
    y: Option<f64>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Struct15 {
    model: String,
    uvlock: Option<bool>,
    x: Option<f64>,
    y: Option<f64>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
#[serde(untagged)]
pub enum Apply3 {
    Array(Vec<ArrayElement5>),
    Struct(Struct15),
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct TElement29 {
    facing: Option<String>,
    slot_0_occupied: Option<String>,
    slot_1_occupied: Option<String>,
    slot_2_occupied: Option<String>,
    slot_3_occupied: Option<String>,
    slot_4_occupied: Option<String>,
    slot_5_occupied: Option<String>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct TElement66 {
    east: Option<String>,
    north: Option<String>,
    south: Option<String>,
    up: Option<String>,
    west: Option<String>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct T24 {
    age: Option<String>,
    AND: Option<Vec<TElement29>>,
    down: Option<String>,
    east: Option<String>,
    facing: Option<String>,
    flower_amount: Option<String>,
    has_bottle_0: Option<String>,
    has_bottle_1: Option<String>,
    has_bottle_2: Option<String>,
    leaves: Option<String>,
    level: Option<String>,
    north: Option<String>,
    OR: Option<Vec<TElement66>>,
    south: Option<String>,
    up: Option<String>,
    west: Option<String>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct TElement2 {
    apply: Apply3,
    when: Option<T24>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct ArrayElement87 {
    model: String,
    x: Option<f64>,
    y: Option<f64>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Struct93 {
    model: String,
    uvlock: Option<bool>,
    x: Option<f64>,
    y: Option<f64>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
#[serde(untagged)]
pub enum TEntry85 {
    Array(Vec<ArrayElement87>),
    Struct(Struct93),
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Root {
    multipart: Option<Vec<TElement2>>,
    variants: Option<std::collections::HashMap<String, TEntry85>>,
}

fn main() {
    let code = include_str!("../../../fixtures/datapack/blockstates/acacia_button.json");
    let root: Root = match serde_json::from_str(code) {
        Ok(root) => root,
        Err(err) => {
            println!("{:#?}", err);
            panic!();
        }
    };
    println!("{:#?}", root);
}
