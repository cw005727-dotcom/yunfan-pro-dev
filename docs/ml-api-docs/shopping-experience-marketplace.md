# Shopping experience

**Tags:** Shopping experience
**Created:** 2023-11-27T12:11:22Z
**Last Updated:** 2026-01-11T23:41:46Z

---

## Shopping experience

Important:

This feature is available in Argentina, Brazil, Uruguay, Mexico, Colombia, Chile and Peru.

Shopping experience is an algorithm that applies new rules to position each item according to its performance based on different customer service indicators. The initiative seeks to help sellers detect problems with their items so that they can improve the quality of their customer service based on their complaints and cancellations.

The impact will be on Mercado Libre's front end, changing the views of the listings Menu, metrics, bulk online editor (EMON) and the individual editor, each one with different visual experiences.  
The purpose of this document is to provide a single source, bringing the shopping experience content into a specific contract for integrators. This facilitates the maintenance of texts and optimizes the quality of the service.

Note:

To the already known experience of the resource [/health](https://developers.mercadolibre.com.ar/en_us/listings-quality) (quality of the listing), now the new shopping experience is added with its different levels and solutions.  
It allows sellers to show the shopping experience they offer in their listings in order to understand how the item is performing with respect to the complaints and cancellations it generates. This way, they can identify the type of problems it is generating, how to improve this situation and what the consequences of its performance are.

The resource **/purchase\_experience/integrators** allows you to identify the status of your listings, with the level reached and their corresponding actionable items in case they need to be improved with respect to the shopping experience offered.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/reputation/items/$ITEM_ID/purchase_experience/integrators
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/reputation/items/MLA1391786841/purchase_experience/integrators?locale=es_AR
```

Response:

```javascript
{
    "item_id": "MLA1391786841",
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "Tienes un problema con este producto. Revisa los consejos sobre cómo mejorar."
        },
        {
            "order": 1,
            "text": "La experiencia que brinda tu publicación afecta tu exposición y podríamos pausarla."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Pausar desde el listado"
        }
    ],
    "reputation": {
        "color": "orange",
        "text": "Media",
        "value": 50
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "PRODUCT",
                "color": "#7267E4",
                "quantity": "1 problema",
                "cancellations": 1,
                "claims": 0,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "POOR_CONDITION",
                    "title": {
                        "text": "Estaban en mal estado"
                    }
                },
                "level_three": {
                    "key": "BROKEN_PRODUCT",
                    "title": {
                        "text": "El producto llegó abierto y/o dañado"
                    },
                    "remedy": {
                        "text": "Revisa que los productos que vendes y su embalaje estén en buenas condiciones antes de enviarlos o despacharlos. "
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-07-04T19:08:56Z",
            "to": "2023-11-04T19:08:56Z",
            "level_one": [
                {
                    "key": "PRODUCT",
                    "title": {
                        "text": "Con el producto entregado"
                    },
                    "color": "#7267E4",
                    "percentage": 100.0,
                    "quantities_level_two": [
                        {
                            "key": "POOR_CONDITION",
                            "title": {
                                "text": "Estaban en mal estado"
                            },
                            "quantity": 11
                        }
                    ]
                }
            ]
        }
    }
}
```

## Required parameters

The only **required parameter is the locale**, to obtain the corresponding texts for each language and provide detailed and clear information.

Query params Type Mandatory Values Only one locale string YES es\_MX,  
es\_UY,  
es\_CO,  
es\_CL,  
es\_AR,  
es\_PE,  
pt\_BR,  
en\_US. YES

### Fields of the reply

**item\_id**: identification of the item being checked.  
**freeze**: experience freeze notice due to which no actions are generated over the item.  
**status**: status information of the listing (active | paused | moderated).  
**title**: main reason why the item is in the current status.  
**subtitles**: details due to which the item is in the current status.  
**actions**: possible actionables to edit the current situation of the item.  
**reputation**: current color, detail and value of the reputation according to the shopping experience.  
**metrics\_details**: details of the problem, levels, possible solutions, actionables and the distribution to give details about the shopping experience of the item.

- Status -&gt; **paused**

<!--THE END-->

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207649856963-Captura-de-Pantalla-2023-11-07-a-la-s--12.58.03.png)

- Status -&gt; **active**

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207648357157-Captura-de-Pantalla-2023-11-08-a-la-s--12.53.53.png)

## Response fields and components

**Text**

```javascript
{
    "order": uint,
    "text": string,
    "placeholders": []string,
}
```

Ejemplo: asdasd {0} asdasd {1}. \[0]

- The {} must be replaced by the placeholders.
- The \[] must be replaced by the action.

```javascript
{
    "text": "Por el momento {0}esta publicación no perderá exposición ni será pausada o anulada por brindar experiencia mala o media.{1} Es importante solucionar sus problemas para mejorar la experiencia que brindas.",
    "placeholders": [
        "",
        ""
    ]
}
```

**Freeze**

The first part of the freeze wording changes according to the type of freeze applied.

- Req\_commercial

```javascript
   "freeze": {
    "text": "Debido a un Acuerdo comercial, {0}esta publicación no perderá exposición, ni será pausada o anulada por tener experiencia de compra mala o media.{1} Ten en cuenta que es importante solucionar los problemas para mejorar la experiencia que brindas.",
    "placeholders": [
        "",
        ""
    ]
},
```

- Internal\_recovery\_grntee

```javascript
  "freeze": {
    "text": "Debido al Beneficio de reputación, {0}esta publicación no perderá exposición, ni será pausada o anulada por tener experiencia de compra mala o media.{1} Ten en cuenta que es importante solucionar los problemas para mejorar la experiencia que brindas.",
    "placeholders": [
        "",
        ""
    ]
},
```

- Internal\_recovery

```javascript
    "freeze": {
    "text": "Debido al Beneficio Verde claro, {0}esta publicación no perderá exposición, ni será pausada o anulada por tener experiencia de compra mala o media.{1} Ten en cuenta que es importante solucionar los problemas para mejorar la experiencia que brindas.",
    "placeholders": [
        "",
        ""
    ]
},
```

- Internal\_newbie\_grntee

```javascript
 "freeze": {
    "text": "Debido al Beneficio de reputación, {0}esta publicación no perderá exposición, ni será pausada o anulada por tener experiencia de compra mala o media.{1} Ten en cuenta que es importante solucionar los problemas para mejorar la experiencia que brindas.",
    "placeholders": [
        "",
        ""
    ]
},
```

- Rest of freeze

The other freeze types are: **grace\_time, internal\_reputation, req\_legal, frozen**.

```javascript
   "freeze": {
    "text": "Por el momento {0}esta publicación no perderá exposición ni será pausada o anulada por brindar experiencia mala o media.{1} Es importante solucionar sus problemas para mejorar la experiencia que brindas.",
    "placeholders": [
        "",
        ""
    ]
},
```

**Status**

```javascript
{
    "id": enum (active | paused | moderated),
    "assigned_by": enum (reputation | other),
    "text": string
}
```

**Subtitles**

A change has been added to obtain the number of sales of an item in the last 180 days and show it on the fronts.

Nota:

Ehis change is gradual, so you should be able to recognize the current answer (without placeholders) and the new answer (with placeholders).  
Consider [the examples of items with a score of 100 (with or without problems)](https://developers.mercadolibre.com.ar/en_us/shopping-experience#Use-case-examples).

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/200485142907-Captura-de-Tela-2024-01-30-a-s-10.30.24.png)

Actual response

```javascript
"subtitles": [
      {
          "order": 0,
          "text": "Tienes 9 problemas con este producto. Revisa los consejos sobre cómo mejorar."
      },
      {
          "order": 1,
          "text": "La experiencia que brinda tu publicación afecta tu exposición y podríamos anularla."
      }
  ],
```

New response

```javascript
"subtitles": [
      {
          "order": 0,
          "text": "En los últimos 180 días hiciste {0}12 ventas{1} y tuviste {0}9 problemas.{1} Revisa los consejos sobre cómo mejorar.",
          "placeholders": [
              "",
              ""
          ]
      },
      {
          "order": 1,
          "text": "La experiencia que brinda tu publicación afecta tu exposición y podríamos anularla."
      }
  ],
```

**Action**

```javascript
{
    "order": uint,
    "text": string,
 }
```

Depending on the condition of the item, the possible actionable items are as follows:

**Active items**

- If the item has a score of 100 and no problems: See publication.
- If the item has a score of 100 with problems or a lower score (excluding score -1, which is when the item has no sales): Modify publication and Pause for listing.

**Paused items**

- Paused by seller: Modify publication and View publication.
- Paused by Shopping Experience: Modify publication and Reactivate from the listing.

**Item cancelled**

- Voided by shopping experience: How to offer a good experience.
- Annulled by other moderation: View post.

**Reputation**

```javascript
{
    "color": string,
    "text": string,
    "value": int
}
```

**Reputation**

```javascript
{
    "color": string,
    "text": string,
    "value": int
}
```

**Metrics details**

```javascript
{
    "empty_state_title": string,
    "problems": []problem,
    "distribution": distribution
}
```

**Problem**

```javascript
{
  "order": unit,
  "key": string, // key de L1
  "color": string, // de L1
  "quantity": text, // de L3
  "cancellations": unit, // de l3
  "claims": unit, // de l3
  "tag": string,
    "level_2": level_2,
    "level_3": level_3
}
```

**Level 2**

```javascript
{
    "key": string, // key de L2
    "title": text,
 }
```

**Level 3**

```javascript
{
    "key": string, // key de L3
    "title": text,
    "remedy": text,
}
```

**Distribution**

```javascript
{
    "from": date,
    "to": date,
    "level_1": []level_1
}
```

**Date format**

```javascript
{"from": "2023-07-04T19:08:56Z",
"to": "2023-11-04T19:08:56Z",
}
```

**Level 1**

```javascript
{
  "key": string, // key de L1
  "title": text,
  "color": string,
  "percentage": float,
  "quantities_level_2": [
        {
            "key": string, // L2 key
            "title": text,
            "quantity": uint
        }
    ]
}
```

### Errors

Error\_code Error message Description 400 Bad Request The request is invalid or cannot be understood by the server. 404 Resource not found The resource is not working or the request was not done properly. 500 Internal Server Error Something went wrong with the server and the request cannot be completed.

## Use case examples

- **Active item with score of 100 (no problems)**

Important:

We do not return the details but we return the **central\_tag: ¡Sigue así! No tienes ventas con problemas en los últimos 180 días.**  
An improvement has been added which allows us to recognize the number of sales of an item in the last 180 days in order to display it, allowing us to show it more accurately.

Example traditional item (no problems):

```javascript
{
    "item_id": "MLA1391786841",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "No tuviste problemas con este producto."
        },
        {
            "order": 1,
            "text": "Estás brindando una buena experiencia de compra. ¡Sigue así!"
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Ver publicación"
        }
    ],
    "reputation": {
        "color": "green",
        "text": "Buena",
        "value": 100
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "empty_state_title": "No tuviste ventas con problemas en los últimos 180 días.",
        "distribution": {
            "from": "2023-07-04T19:08:56Z",
            "to": "2023-11-04T19:08:56Z",
            "level_one": []
        }
    }
 }
```

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/200316381294-Captura-de-Tela-2024-02-01-a-s-09.33.22.png)

Example of traditional item response with Score 100 (with problems):

```javascript
{
    "item_id": "MLA1391786841",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "En los últimos 180 días hiciste {0}12 ventas{1} y tuviste {0}9 problemas.{1}",
            "placeholders": [
                "",
                ""
            ]
        },
        {
            "order": 1,
            "text": "Estás brindando una buena experiencia de compra, pero si continúas con problemas, podría impactar tu exposición."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Pausar desde el listado"
        }
    ],
    "reputation": {
        "color": "green",
        "text": "Buena",
        "value": 100
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "3 problemas",
                "cancellations": 2,
                "claims": 1,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "PRODUCT_NOT_PREPARED",
                    "title": {
                        "order": 0,
                        "text": "El producto no terminó de prepararse"
                    },
                    "remedy": {
                        "order": 0,
                        "text": "Valida el stock disponible de tu publicación y revisa los tiempos que tienes para preparar tu envío. Si por algún motivo, no estarás o no tienes stock suficiente, pausa tu publicación."
                    }
                }
            },
            {
                "order": 1,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 2,
                "claims": 0,
                "tag": "",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "LABEL_PRINTING_PROBLEMS",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para imprimir la etiqueta"
                    },
                    "remedy": {
                        "order": 0,
                        "text": "Verifica que la impresión sea de buena calidad, no cambies el tamaño de la etiqueta y al pegar la etiqueta en el paquete, no la rayes ni la tapes con la cinta adhesiva."
                    }
                }
            },
            {
                "order": 2,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 2,
                "claims": 0,
                "tag": "",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "WITHOUT_STOCK",
                    "title": {
                        "order": 0,
                        "text": "No tenías stock disponible"
                    },
                    "remedy": {
                        "order": 0,
                        "text": "Valida el stock disponible de tu publicación y revisa los tiempos que tienes para preparar tu envío. Si por algún motivo, no estarás o no tienes stock suficiente, pausa tu publicación."
                    }
                }
            },
            {
                "order": 3,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 0,
                "claims": 2,
                "tag": "",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "STOP_DUE_HOLIDAY",
                    "title": {
                        "order": 0,
                        "text": "No estabas operando o parecías inactivo"
                    },
                    "remedy": {
                        "order": 0,
                        "text": "Si por algún motivo, no estarás disponible te sugerimos pausar tus publicaciones."
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-04-13T20:08:26Z",
            "to": "2023-10-10T20:08:26Z",
            "level_one": [
                {
                    "key": "OPERATION",
                    "title": {
                        "order": 0,
                        "text": "Al gestionar o preparar la venta"
                    },
                    "color": "#EC79BC",
                    "percentage": 100.0,
                    "quantities_level_two": [
                        {
                            "key": "PACK_OFF",
                            "title": {
                                "order": 0,
                                "text": "Dificultades para preparar el pedido"
                            },
                            "quantity": 9
                        }
                    ]
                }
            ]
        }
    }
 }
```

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/200485142907-Captura-de-Tela-2024-01-30-a-s-10.30.24.png)

Example response for catalog item (no problem):

```javascript
{
    "item_id": "MLA1391786841",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "No tuviste problemas con este producto."
        },
        {
            "order": 1,
            "text": "Brindar buena experiencia te ayuda a competir en catálogo."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Ver publicación"
        }
    ],
    "reputation": {
        "color": "green",
        "text": "Buena",
        "value": 100
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "empty_state_title": "No tuviste ventas con problemas en los últimos 180 días.",
        "distribution": {
            "from": "2023-07-04T19:08:56Z",
            "to": "2023-11-04T19:08:56Z",
            "level_one": []
        }
    }
 }
```

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/200310153598-Captura-de-Tela-2024-02-01-a-s-11.17.11.png)

Example catalog item response (with problems):

```javascript
{
    "item_id": "MLA1391786841",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "En los últimos 180 días hiciste {0}12 ventas{1} y tuviste {0}9 problemas.{1}",
            "placeholders": [
                "",
                ""
            ]
        },
        {
            "order": 1,
            "text": "Estás brindando una buena experiencia de compra, pero si continúas con problemas, podría afectarte en la competencia en catálogo."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Pausar desde el listado"
        }
    ],
    "reputation": {
        "color": "green",
        "text": "Buena",
        "value": 100
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "3 problemas",
                "cancellations": 2,
                "claims": 1,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "PRODUCT_NOT_PREPARED",
                    "title": {
                        "order": 0,
                        "text": "El producto no terminó de prepararse"
                    },
                    "remedy": {
                        "order": 0,
                        "text": "Valida el stock disponible de tu publicación y revisa los tiempos que tienes para preparar tu envío. Si por algún motivo, no estarás o no tienes stock suficiente, pausa tu publicación."
                    }
                }
            },
            {
                "order": 1,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 2,
                "claims": 0,
                "tag": "",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "LABEL_PRINTING_PROBLEMS",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para imprimir la etiqueta"
                    },
                    "remedy": {
                        "order": 0,
                        "text": "Verifica que la impresión sea de buena calidad, no cambies el tamaño de la etiqueta y al pegar la etiqueta en el paquete, no la rayes ni la tapes con la cinta adhesiva."
                    }
                }
            },
            {
                "order": 2,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 2,
                "claims": 0,
                "tag": "",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "WITHOUT_STOCK",
                    "title": {
                        "order": 0,
                        "text": "No tenías stock disponible"
                    },
                    "remedy": {
                        "order": 0,
                        "text": "Valida el stock disponible de tu publicación y revisa los tiempos que tienes para preparar tu envío. Si por algún motivo, no estarás o no tienes stock suficiente, pausa tu publicación."
                    }
                }
            },
            {
                "order": 3,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 0,
                "claims": 2,
                "tag": "",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "order": 0,
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "STOP_DUE_HOLIDAY",
                    "title": {
                        "order": 0,
                        "text": "No estabas operando o parecías inactivo"
                    },
                    "remedy": {
                        "order": 0,
                        "text": "Si por algún motivo, no estarás disponible te sugerimos pausar tus publicaciones."
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-04-13T20:08:26Z",
            "to": "2023-10-10T20:08:26Z",
            "level_one": [
                {
                    "key": "OPERATION",
                    "title": {
                        "order": 0,
                        "text": "Al gestionar o preparar la venta"
                    },
                    "color": "#EC79BC",
                    "percentage": 100.0,
                    "quantities_level_two": [
                        {
                            "key": "PACK_OFF",
                            "title": {
                                "order": 0,
                                "text": "Dificultades para preparar el pedido"
                            },
                            "quantity": 9
                        }
                    ]
                }
            ]
        }
    }
 }
```

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/200310090291-Captura-de-Tela-2024-02-01-a-s-11.18.03.png)

- **Active item with score of 50**

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207219927464-Captura-de-Pantalla-2023-11-13-a-la-s--11.54.09.png)

Example:

```javascript
{
    "item_id": "MLA1391786841",
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "Tienes un problema con este producto. Revisa los consejos sobre cómo mejorar."
        },
        {
            "order": 1,
            "text": "La experiencia que brinda tu publicación afecta tu exposición y podríamos pausarla."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Pausar desde el listado"
        }
    ],
    "reputation": {
        "color": "orange",
        "text": "Media",
        "value": 50
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "PRODUCT",
                "color": "#7267E4",
                "quantity": "1 problema",
                "cancellations": 1,
                "claims": 0,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "POOR_CONDITION",
                    "title": {
                        "text": "Estaban en mal estado"
                    }
                },
                "level_three": {
                    "key": "BROKEN_PRODUCT",
                    "title": {
                        "text": "El producto llegó abierto y/o dañado"
                    },
                    "remedy": {
                        "text": "Revisa que los productos que vendes y su embalaje estén en buenas condiciones antes de enviarlos o despacharlos. "
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-07-04T19:08:56Z",
            "to": "2023-11-04T19:08:56Z",
            "level_one": [
                {
                    "key": "PRODUCT",
                    "title": {
                        "text": "Con el producto entregado"
                    },
                    "color": "#7267E4",
                    "percentage": 100,
                    "quantities_level_two": [
                        {
                            "key": "POOR_CONDITION",
                            "title": {
                                "text": "Estaban en mal estado"
                            },
                            "quantity": 11
                        }
                    ]
                }
            ]
        }
    }
}
```

- **Inactive items due to shopping experience**

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207201284373-Captura-de-Pantalla-2023-11-13-a-la-s--17.04.57.png)

Example:

```javascript
{
    "item_id": "MLA1391786841",
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "Tuviste un problema con este producto. Revisa los consejos sobre cómo mejorar."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Reactivar desde el listado"
        }
    ],
    "reputation": {
        "color": "red",
        "text": "Mala",
        "value": 30
    },
    "status": {
        "id": "paused",
        "assigned_by": "reputation",
        "text": "Tu publicación está inactiva. La pausamos porque está brindando una mala experiencia de compra."
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "PRODUCT",
                "color": "#7267E4",
                "quantity": "1 problema",
                "cancellations": 0,
                "claims": 1,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "POOR_CONDITION",
                    "title": {
                        "text": "Estaban en mal estado"
                    }
                },
                "level_three": {
                    "key": "PRODUCT_IN_BAD_CONDITION",
                    "title": {
                        "text": "El producto llegó en mal estado"
                    },
                    "remedy": {
                        "text": "Revisa que los productos que vendes estén en buenas condiciones antes de enviarlos o despacharlos. "
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-04-21T18:41:45Z",
            "to": "2023-10-18T18:41:45Z",
            "level_one": [
                {
                    "key": "PRODUCT",
                    "title": {
                        "text": "Con el producto entregado"
                    },
                    "color": "#7267E4",
                    "percentage": 100.0,
                    "quantities_level_two": [
                        {
                            "key": "POOR_CONDITION",
                            "title": {
                                "text": "Estaban en mal estado"
                            },
                            "quantity": 1
                        }
                    ]
                }
            ]
        }
    }
}
```

- **Inactive due to moderations, it can be reactivated.**

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207219423255-Captura-de-Pantalla-2023-11-13-a-la-s--12.02.17.png)

Example:

```javascript
{
    "item_id": "MLU1234",
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "Tuviste 9 problemas con este producto. Revisa los consejos sobre cómo mejorar."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Reactivar desde el listado"
        }
    ],
    "reputation": {
        "color": "red",
        "text": "Mala",
        "value": 30
    },
    "status": {
        "id": "paused",
        "assigned_by": "reputation",
        "text": "Tu publicación está inactiva. La pausamos porque está brindando una mala experiencia de compra."
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "3 problemas",
                "cancellations": 2,
                "claims": 1,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "PRODUCT_NOT_PREPARED",
                    "title": {
                        "text": "El producto no terminó de prepararse"
                    },
                    "remedy": {
                        "text": "Valida el stock disponible de tu publicación y revisa los tiempos que tienes para preparar tu envío. Si por algún motivo, no estarás o no tienes stock suficiente, pausa tu publicación."
                    }
                }
            },
            {
                "order": 1,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 2,
                "claims": 0,
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "LABEL_PRINTING_PROBLEMS",
                    "title": {
                        "text": "Dificultades para imprimir la etiqueta"
                    },
                    "remedy": {
                        "text": "Verifica que la impresión sea de buena calidad, no cambies el tamaño de la etiqueta y al pegar la etiqueta en el paquete, no la rayes ni la tapes con la cinta adhesiva."
                    }
                }
            },
            {
                "order": 2,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 2,
                "claims": 0,
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "WITHOUT_STOCK",
                    "title": {
                        "text": "No tenías stock disponible"
                    },
                    "remedy": {
                        "text": "Valida el stock disponible de tu publicación y revisa los tiempos que tienes para preparar tu envío. Si por algún motivo, no estarás o no tienes stock suficiente, pausa tu publicación."
                    }
                }
            },
            {
                "order": 3,
                "key": "OPERATION",
                "color": "#EC79BC",
                "quantity": "2 problemas",
                "cancellations": 0,
                "claims": 2,
                "level_two": {
                    "key": "PACK_OFF",
                    "title": {
                        "text": "Dificultades para preparar el pedido"
                    }
                },
                "level_three": {
                    "key": "STOP_DUE_HOLIDAY",
                    "title": {
                        "text": "No estabas operando o parecías inactivo"
                    },
                    "remedy": {
                        "text": "Si por algún motivo, no estarás disponible te sugerimos pausar tus publicaciones."
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-04-03T00:51:39Z",
            "to": "2023-09-30T00:51:39Z",
            "level_one": [
                {
                    "key": "OPERATION",
                    "title": {
                        "text": "Al gestionar o preparar la venta"
                    },
                    "color": "#EC79BC",
                    "percentage": 100.0,
                    "quantities_level_two": [
                        {
                            "key": "PACK_OFF",
                            "title": {
                                "text": "Dificultades para preparar el pedido"
                            },
                            "quantity": 9
                        }
                    ]
                }
            ]
        }
    }
}
```

- **Paused item due to shopping experience**

The shopping experience falls to 30.

![](https:////http2.mlstatic.com/storage/developers-site-cms-admin/207209586260-Captura-de-Pantalla-2023-11-13-a-la-s--14.46.38.png)

Example:

```javascript
{
    "item_id": "MLA1391786841",
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "Tuviste 15 problemas con este producto."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Ver publicación"
        }
    ],
    "reputation": {
        "color": "red",
        "text": "Mala",
        "value": 30
    },
    "status": {
        "id": "paused",
        "assigned_by": "other",
        "text": "Tu publicación está inactiva."
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "PRODUCT",
                "color": "#7267E4",
                "quantity": "15 problemas",
                "cancellations": 3,
                "claims": 7,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "POOR_CONDITION",
                    "title": {
                        "text": "Estaban en mal estado"
                    }
                },
                "level_three": {
                    "key": "DEFECTS_AFTER_USE",
                    "title": {
                        "text": "Aparecieron defectos después del uso del producto"
                    },
                    "remedy": {
                        "text": "Asegúrate de vender productos de buena calidad. Si tu producto tiene defectos de fábrica, reemplázalos lo antes posible."
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-07-04T19:08:56Z",
            "to": "2023-11-04T19:08:56Z",
            "level_one": [
                {
                    "key": "PRODUCT",
                    "title": {
                        "text": "Con el producto entregado"
                    },
                    "color": "#7267E4",
                    "percentage": 100.0,
                    "quantities_level_two": [
                        {
                            "key": "POOR_CONDITION",
                            "title": {
                                "text": "Estaban en mal estado"
                            },
                            "quantity": 15
                        }
                    ]
                }
            ]
        }
    }
}
```

- **Inactive item due to the seller**

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207219214161-Captura-de-Pantalla-2023-11-13-a-la-s--12.05.56.png)

Example:

```javascript
{
    "item_id": "MLA1391786841",
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "Estás brindando una buena experiencia de compra. ¡Sigue así!"
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Ver publicación"
        }
    ],
    "reputation": {
        "color": "green",
        "text": "Buena",
        "value": 100
    },
    "status": {
        "id": "paused",
        "assigned_by": "other",
        "text": "Tu publicación está inactiva."
    },
    "metrics_details": {
        "empty_state_title": "No tuviste ventas con problemas en los últimos 180 días.",
        "distribution": {
            "from": "2023-04-21T18:39:20Z",
            "to": "2023-10-18T18:39:20Z",
            "level_one": []
        }
    }
}
```

- **Item without shopping experience**

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207219095710-Captura-de-Pantalla-2023-11-13-a-la-s--12.08.13.png)

Important:

We do not return the details, we return **empty\_state\_title: No tuviste ventas con problemas en los últimos 180 días.**

Example:

```javascript
{
    "item_id": "MLA1391786841",
    "title": {
        "text": "Aún no podemos medir tu experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "La calcularemos con las ventas de los últimos 180 días."
        }
    ],
    "actions": [],
    "reputation": {
        "color": "gray",
        "value": -1
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "empty_state_title": "No tuviste ventas con problemas en los últimos 180 días.",
        "distribution": {
            "from": "2023-07-04T19:08:56Z",
            "to": "2023-11-04T19:08:56Z",
            "level_one": []
        }
    }
}
```

- **Freezed item**

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207119457155-Captura-de-Pantalla-2023-11-14-a-la-s--15.48.39.png)

Example:

```javascript
{
    "item_id": "MLA1391786841",
    "freeze": {
        "text": "Por el momento {0}esta publicación no perderá exposición ni será pausada o anulada por brindar experiencia mala o media.{1} Es importante solucionar sus problemas para mejorar la experiencia que brindas.",
        "placeholders": [
            "",
            ""
        ]
    },
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "Tienes 22 problemas con este producto. Revisa los consejos sobre cómo mejorar."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Pausar desde el listado"
        }
    ],
    "reputation": {
        "color": "orange",
        "text": "Media",
        "value": 65
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "PRODUCT",
                "color": "#7267E4",
                "quantity": "10 problemas",
                "cancellations": 3,
                "claims": 7,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "POOR_CONDITION",
                    "title": {
                        "text": "Estaban en mal estado"
                    }
                },
                "level_three": {
                    "key": "PRODUCT_IN_BAD_CONDITION",
                    "title": {
                        "text": "El producto llegó en mal estado"
                    },
                    "remedy": {
                        "text": "Revisa que los productos que vendes estén en buenas condiciones antes de enviarlos o despacharlos. "
                    }
                }
            },
            {
                "order": 1,
                "key": "PRODUCT",
                "color": "#7267E4",
                "quantity": "12 problemas",
                "cancellations": 3,
                "claims": 7,
                "level_two": {
                    "key": "POOR_CONDITION",
                    "title": {
                        "text": "Estaban en mal estado"
                    }
                },
                "level_three": {
                    "key": "NEXT_TO_EXPIRE",
                    "title": {
                        "text": "El producto había expirado o iba a expirar pronto"
                    },
                    "remedy": {
                        "text": "Verifica la fecha de expiración de los productos que vendes antes de despacharlos o enviarlos."
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-07-04T19:08:56Z",
            "to": "2023-11-04T19:08:56Z",
            "level_one": [
                {
                    "key": "PRODUCT",
                    "title": {
                        "text": "Con el producto entregado"
                    },
                    "color": "#7267E4",
                    "percentage": 100.0,
                    "quantities_level_two": [
                        {
                            "key": "POOR_CONDITION",
                            "title": {
                                "text": "Estaban en mal estado"
                            },
                            "quantity": 22
                        }
                    ]
                }
            ]
        }
    }
}
```

- **Level of shooping experience level 30 - Reactivated**

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207218833236-Captura-de-Pantalla-2023-11-13-a-la-s--12.12.32.png)

Example:

```javascript
{
    "item_id": "MLA1391786841",
    "title": {
        "text": "Experiencia de compra"
    },
    "subtitles": [
        {
            "order": 0,
            "text": "Tienes un problema con este producto. Revisa los consejos sobre cómo mejorar."
        },
        {
            "order": 1,
            "text": "Podríamos anular tu publicación si continúa brindando mala experiencia."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modificar publicación"
        },
        {
            "order": 1,
            "text": "Pausar desde el listado"
        }
    ],
    "reputation": {
        "color": "red",
        "text": "Mala",
        "value": 30
    },
    "status": {
        "id": "active"
    },
    "metrics_details": {
        "problems": [
            {
                "order": 0,
                "key": "PRODUCT",
                "color": "#7267E4",
                "quantity": "1 problema",
                "cancellations": 0,
                "claims": 1,
                "tag": "PROBLEMA PRINCIPAL",
                "level_two": {
                    "key": "POOR_CONDITION",
                    "title": {
                        "text": "Estaban en mal estado"
                    }
                },
                "level_three": {
                    "key": "PRODUCT_IN_BAD_CONDITION",
                    "title": {
                        "text": "El producto llegó en mal estado"
                    },
                    "remedy": {
                        "text": "Revisa que los productos que vendes estén en buenas condiciones antes de enviarlos o despacharlos. "
                    }
                }
            }
        ],
        "distribution": {
            "from": "2023-04-21T09:06:05Z",
            "to": "2023-10-18T09:06:05Z",
            "level_one": [
                {
                    "key": "PRODUCT",
                    "title": {
                        "text": "Con el producto entregado"
                    },
                    "color": "#7267E4",
                    "percentage": 100.0,
                    "quantities_level_two": [
                        {
                            "key": "POOR_CONDITION",
                            "title": {
                                "text": "Estaban en mal estado"
                            },
                            "quantity": 1
                        }
                    ]
                }
            ]
        }
    }
}
```

## Details of the problems

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207217872506-Captura-de-Pantalla-2023-11-13-a-la-s--12.28.34.png)  
![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207217707589-Captura-de-Pantalla-2023-11-13-a-la-s--12.31.20.png)  
![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207119203523-Captura-de-Pantalla-2023-11-14-a-la-s--15.52.55.png)

## Distribution with tooltip

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/207216019767-Captura-de-Pantalla-2023-11-13-a-la-s--12.59.25.png)

Example:

```javascript
{
    "distribution": {
        "from": "2023-02-01T00:00:00-03:00",
        "to": "2023-08-11T00:00:00-03:00",
        "level_1": [
            {
                "key": "OPERATION",
                "title": {
                    "text": "Con el producto entregado"
                },
                "color": "#102012",
                "percentage": 80,
                "quantities_level_2": [
                    {
                        "key": "X",
                        "title": {
                            "text": "Tenia fallas"
                        },
                        "quantity": 70
                    },
                    {
                        "key": "X",
                        "title": {
                            "text": "Es diferente a lo pedido"
                        },
                        "quantity": 16
                    }
                ]
            },
            {
                "key": "X",
                "title": {
                    "text": "Al despachar o entregar el producto"
                },
                "color": "#103012",
                "percentage": 15
            },
            {
                "key": "PRODUCT_NOT_PREPARED",
                "title": {
                    "text": "Al preparar o gestionar la venta"
                },
                "color": "#103012",
                "percentage": 5
            }
        ]
    }
}
```

## Get by User Product (New)

This resource allows integrators to consume the purchase experience oriented to User Products (UPs) with Artificial Intelligence analysis. This model incorporates new information sources, detailed reasoning about the "why" behind it, and suggests actions.

- **Explainable AI:** Detailed reasoning about the "purchase experience" score of your products.
- **Complete View:** Considers shipping delays, seller cancellations and issues detected in claims, reviews and communications.
- **Intelligent Evaluation:** For products with few sales, it uses the performance of similar products from the same seller.
- **Optimized Focus:** Buyer remorse is no longer considered.

### Call

```javascript

curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/reputation/user_products/{UP_ID}/purchase_experience/integrators
```

### Example

```javascript

curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/reputation/users_products/MLAU1391786841/purchase_experience/integrators?locale=es_AR
```

### Response

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": "Make sure to avoid problems in your next sales to protect your exposure."
        }
    },
    "reputation": {
        "color": "green",
        "text": "Good",
        "value": 100
    },
    "status": {
        "id": "active"
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": "What we evaluated to calculate your performance"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "You kept the product issue rate low. You handled claims and cancellations effectively..."
            }
        ]
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": "What you can do"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "Review your delivery processes to reduce delays."
            },
            {
                "order": 1,
                "text": "Improve claims management."
            }
        ]
    },
    "principal_actionable": {
        "order": 0,
        "text": "Make sure to deliver the correct product."
    },
    "ai_generated": {
        "order": 0,
        "text": "Generated by artificial intelligence"
    }
}
```

### Required parameters

The only required parameter is locale, in order to obtain the texts for each language, providing detailed and clear information.

Query params Type Mandatory Values Only one locale string YES es\_MX, es\_UY, es\_CO, es\_CL, es\_AR, es\_PE, pt\_BR YES

### Response fields

- **up\_id (string):** Unique identifier of the User Product.
- **freeze (object):** Object that contains information about the freeze applied to the UP.
- **text (string):** Freeze notice of experience for which consequences are not applied to the UP (may be empty).
- **placeholders (array of strings):** Array of strings representing the placeholders to format the "freeze" text. Example: asdasd {0} asdasd {1}. The {} should be replaced by the placeholders.
- **title (object):** Object that contains the section title.
- **text (string):** Title text (in this case, "Purchase experience").
- **consequence (object):** Object that describes the possible consequence based on the UP's purchase experience result.
- **title (object):** Object that contains the consequence text.
- **order (integer):** Order of the consequence.
- **text (string):** Consequence text.
- **reputation (object):** Object that describes the product's purchase experience.
- **color (string):** Color associated with the purchase experience (e.g., "green").
- **text (string):** Textual description of the purchase experience (e.g., "Buena").
- **value (integer):** Numeric value of the purchase experience (e.g., 100).
- **status (object):** Object that describes the UP status.
- **id (string):** Status identifier (e.g., "active").
- **reasoning (object):** Object that explains the reasoning behind the evaluation.
- **title (object):** Object that contains the reasoning title.
- **order (integer):** Order of the reasoning title.
- **text (string):** Reasoning title text.
- **subtitles (array of objects):** Array of subtitles that explain the reasoning.
- **order (integer):** Order of the subtitle.
- **text (string):** Subtitle text.
- **recommendations (object):** Object that contains recommendations to improve.
- **title (object):** Object that contains the recommendations title.
- **order (integer):** Order of the recommendations title.
- **text (string):** Recommendations title text.
- **subtitles (array of objects):** Array of specific recommendations (may return up to 3 recommendations per UP).
- **order (integer):** Order of the recommendation.
- **text (string):** Recommendation text.
- **principal\_actionable (object):** Object that describes the main action to take as a summary of recommendations.
- **order (integer):** Order of the main action.
- **text (string):** Main action text.
- **ai\_generated (object):** Object indicating the information was generated by AI.
- **order (integer):** Order of the AI indication.
- **text (string):** Text indicating the information was generated by AI.

## Examples

### Active UP with score 100 - without recommendations

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/140076169757-xp-compra-sin-recomendaciones.png)

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": "Well done! Make sure to avoid problems in your next sales to protect your exposure."
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify listing"
        }
    ],
    "reputation": {
        "color": "green",
        "text": "Good",
        "value": 100
    },
    "status": {
        "id": "active"
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": "What we evaluated to calculate your performance"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "You provided an excellent purchase experience. Keep maintaining this performance in your next sales."
            }
        ]
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": ""
        },
        "subtitles": []
    },
    "principal_actionable": {
        "order": 0,
        "text": ""
    },
    "ai_generated": {
        "order": 0,
        "text": "Generated by artificial intelligence"
    }
}
```

### Active UP with score 100 - with recommendations / score 75

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/140075446583-xp-compra-score-75.png)

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": "Make sure to avoid problems in your next sales to protect your exposure."
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify listing"
        }
    ],
    "reputation": {
        "color": "green",
        "text": "Good",
        "value": 100
    },
    "status": {
        "id": "active"
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": "What we evaluated to calculate your performance"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "You kept the product issue rate low. You handled claims, cancellations and delays effectively. You achieved above-average reviews."
            }
        ]
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": "What you can do"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "Review your delivery processes to reduce delays and meet promised times."
            },
            {
                "order": 1,
                "text": "Improve claims management to resolve them quickly and completely."
            },
            {
                "order": 2,
                "text": "Adjust quality controls to reduce product incidents."
            }
        ]
    },
    "principal_actionable": {
        "order": 0,
        "text": "Make sure to deliver the correct product."
    },
    "ai_generated": {
        "order": 0,
        "text": "Generated by artificial intelligence"
    }
}
```

### Active UP with score 65 - 50

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": "It is affecting your exposure. We could remove your listing if you continue providing a poor experience."
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify listing"
        }
    ],
    "reputation": {
        "color": "orange",
        "text": "Average",
        "value": 65
    },
    "status": {
        "id": "active"
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": "What we evaluated to calculate your performance"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "You experienced repeated shipping delays. You had unresolved claims and a higher proportion of product issues than the category. Your reviews were slightly below average."
            }
        ]
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": "What you can do"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "Review your delivery processes to reduce delays and meet promised times."
            },
            {
                "order": 1,
                "text": "Improve claims management to resolve them quickly and completely."
            },
            {
                "order": 2,
                "text": "Adjust quality controls to reduce product incidents."
            }
        ]
    },
    "principal_actionable": {
        "order": 0,
        "text": "Make sure to deliver the correct product."
    },
    "ai_generated": {
        "order": 0,
        "text": "Generated by artificial intelligence"
    }
}
```

### Active UP with score 30

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": "You have very low exposure. We could remove your listing if you continue providing a poor experience."
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify publicación"
        }
    ],
    "reputation": {
        "color": "red",
        "text": "Bad",
        "value": 30
    },
    "status": {
        "id": "active"
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": "What we evaluated to calculate your performance"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "You experienced repeated shipping delays. You had unresolved claims and a higher proportion of product issues than the category. Your reviews were slightly below average."
            }
        ]
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": "What you can do"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "Review your delivery processes to reduce delays and meet promised times."
            },
            {
                "order": 1,
                "text": "Improve claims management to resolve them quickly and completely."
            },
            {
                "order": 2,
                "text": "Adjust quality controls to reduce product incidents."
            }
        ]
    },
    "principal_actionable": {
        "order": 0,
        "text": "Make sure to deliver the correct product."
    },
    "ai_generated": {
        "order": 0,
        "text": "Generated by artificial intelligence"
    }
}
```

### Paused UP with score 50

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": ""
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify publicación"
        }
    ],
    "reputation": {
        "color": "orange",
        "text": "Average",
        "value": 50
    },
    "status": {
        "id": "paused",
        "text": "Your listing is inactive."
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": "What we evaluated to calculate your performance"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "You experienced repeated shipping delays. You had unresolved claims and a higher proportion of product issues than the category. Your reviews were slightly below average."
            }
        ]
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": "What you can do"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "Review your delivery processes to reduce delays and meet promised times."
            },
            {
                "order": 1,
                "text": "Improve claims management to resolve them quickly and completely."
            },
            {
                "order": 2,
                "text": "Adjust quality controls to reduce product incidents."
            }
        ]
    },
    "principal_actionable": {
        "order": 0,
        "text": "Make sure to deliver the correct product."
    },
    "ai_generated": {
        "order": 0,
        "text": "Generated by artificial intelligence"
    }
}
```

### Moderated UP with score 30

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": ""
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify publicación"
        }
    ],
    "reputation": {
        "color": "red",
        "text": "Bad",
        "value": 30
    },
    "status": {
        "id": "moderated",
        "text": "Your listing is inactive."
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": "What we evaluated to calculate your performance"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "You experienced repeated shipping delays. You had unresolved claims and a higher proportion of product issues than the category. Your reviews were slightly below average."
            }
        ]
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": "What you can do"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "Review your delivery processes to reduce delays and meet promised times."
            },
            {
                "order": 1,
                "text": "Improve claims management to resolve them quickly and completely."
            },
            {
                "order": 2,
                "text": "Adjust quality controls to reduce product incidents."
            }
        ]
    },
    "principal_actionable": {
        "order": 0,
        "text": "Make sure to deliver the correct product."
    },
    "ai_generated": {
        "order": 0,
        "text": "Generated by artificial intelligence"
    }
}
```

### Frozen UP with score 50

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": "For the moment this listing will not lose exposure nor will we remove it for providing a poor or average experience. {0}Avoid problems in your next sales to improve.{1}",
        "placeholders": [
            "",
            ""
        ]
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": ""
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify publicación"
        }
    ],
    "reputation": {
        "color": "orange",
        "text": "Average",
        "value": 50
    },
    "status": {
        "id": "active"
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": "What we evaluated to calculate your performance"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "You experienced repeated shipping delays. You had unresolved claims and a higher proportion of product issues than the category. Your reviews were slightly below average."
            }
        ]
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": "What you can do"
        },
        "subtitles": [
            {
                "order": 0,
                "text": "Review your delivery processes to reduce delays and meet promised times."
            },
            {
                "order": 1,
                "text": "Improve claims management to resolve them quickly and completely."
            },
            {
                "order": 2,
                "text": "Adjust quality controls to reduce product incidents."
            }
        ]
    },
    "principal_actionable": {
        "order": 0,
        "text": "Make sure to deliver the correct product."
    },
    "ai_generated": {
        "order": 0,
        "text": "Generated by artificial intelligence"
    }
}
```

### No purchase experience UP

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": ""
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        },
        {
            "order": 2,
            "text": "You have not had enough sales yet to calculate it."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify publicación"
        }
    ],
    "reputation": {
        "color": "gray",
        "value": -1
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": ""
        },
        "subtitles": []
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": ""
        },
        "subtitles": []
    },
    "principal_actionable": {
        "order": 0,
        "text": ""
    },
    "ai_generated": {
        "order": 0,
        "text": ""
    }
}
```

### UP in fallback state

```javascript

{
    "up_id": "MLMU1234",
    "freeze": {
        "text": ""
    },
    "title": {
        "text": "Purchase experience"
    },
    "consequence": {
        "title": {
            "order": 0,
            "text": ""
        }
    },
    "subtitles": [
        {
            "order": 0,
            "text": "To calculate it, we compared your performance with other sellers. We considered the claims you receive, shipping delays and cancellations you make."
        },
        {
            "order": 1,
            "text": "We also analyze questions and answers, reviews and your messaging to identify product issues."
        },
        {
            "order": 2,
            "text": "We could not calculate your purchase experience."
        }
    ],
    "actions": [
        {
            "order": 0,
            "text": "Modify publicación"
        }
    ],
    "reputation": {
        "color": "gray",
        "value": -1
    },
    "reasoning": {
        "title": {
            "order": 0,
            "text": ""
        },
        "subtitles": []
    },
    "recommendations": {
        "title": {
            "order": 0,
            "text": ""
        },
        "subtitles": []
    },
    "principal_actionable": {
        "order": 0,
        "text": ""
    },
    "ai_generated": {
        "order": 0,
        "text": ""
    }
}
```

### Possible errors

Error\_code Error message Description 400 Bad Request The request is invalid or cannot be understood by the server. 404 Resource not found The resource is not available or the call was made incorrectly. 500 Internal Server Error The server encountered an unexpected error and cannot complete the request.