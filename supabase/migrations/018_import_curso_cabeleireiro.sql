-- Importação de dados: curso real "Hairclass: Cabeleireiro Feminino
-- Profissional" (curso-cabeleireiro.json), com as regras de regras_avaliacao
-- pedidas: quiz de módulo obrigatório pra avançar, prova final só libera
-- depois de todos os quizzes aprovados, prova final com 3 tentativas,
-- embaralhar perguntas e opções, gabarito só após aprovar ou esgotar
-- tentativas, nota mínima 70%.
--
-- Gerado automaticamente a partir do JSON (não digitado à mão) pra evitar
-- erro de transcrição nas 62 perguntas. Script gerador:
-- gerar_import_cabeleireiro.js (scratchpad da sessão, não faz parte do repo).
--
-- Usa o aluno de teste já existente (nome ILIKE 'ZZZ TESTE ALUNO%') pra achar
-- o salao_id certo e já matricular ele no curso novo, pra dar pra testar no
-- preview sem passo manual extra.
--
-- 100% aditivo: cria linhas novas em cursos/curso_modulos/curso_aulas/
-- curso_provas/curso_prova_perguntas/curso_matriculas. Nenhuma tabela ou
-- linha existente é alterada.

DO $$
DECLARE
  v_salao_id text;
  v_aluno_teste_id uuid;
  v_curso_id uuid;
  v_modulo_id uuid;
  v_prova_id uuid;
  v_matricula_id uuid;
BEGIN
  SELECT salao_id, id INTO v_salao_id, v_aluno_teste_id
  FROM curso_alunos WHERE nome ILIKE 'ZZZ TESTE ALUNO%'
  ORDER BY criado_em DESC LIMIT 1;

  IF v_salao_id IS NULL THEN
    RAISE EXCEPTION 'Aluno de teste (nome ILIKE ''ZZZ TESTE ALUNO%%'') não encontrado em curso_alunos — crie um antes de rodar este script.';
  END IF;

  INSERT INTO cursos (
    salao_id, nome, descricao, categoria, modalidade,
    gera_certificado, certificado_presenca_minima_pct,
    certificado_exige_provas_aprovadas, certificado_exige_exercicios,
    quiz_modulo_bloqueia_proximo, prova_final_exige_quizzes_aprovados,
    status
  ) VALUES (
    v_salao_id, 'Hairclass: Cabeleireiro Feminino Profissional', 'Curso completo de cabeleireiro feminino para quem tem pouca ou nenhuma experiência: profissão, marketing, biossegurança, anatomia, colorimetria, química capilar, corte e visagismo. Baseado na apostila oficial Aflor (Metodologia Florescer).', 'Cabeleireiro', 'online',
    true, 0,
    true, false,
    true, true,
    'ativo'
  ) RETURNING id INTO v_curso_id;

  -- ===== Módulo 1: A profissão e a metodologia Florescer =====
  INSERT INTO curso_modulos (curso_id, salao_id, nome, descricao, ordem)
  VALUES (v_curso_id, v_salao_id, 'A profissão e a metodologia Florescer', 'Quem é a cabeleireira profissional, as formas de atuar no mercado e as especialidades possíveis.', 1)
  RETURNING id INTO v_modulo_id;
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Boas-vindas e a metodologia Florescer', 'Apostila p. 2', 'texto', 'A metodologia FLORESÇA (Prospere, brilhe, distinga, patenteie, desenvolva) foi criada por Ana Flor e equipe. Ela respeita o limite atual de cada aluna e mostra o caminho para evoluir. As técnicas são ferramentas; a transformação começa de dentro.

Pontos-chave:
- FLORESÇA = Prospere, brilhe, distinga, patenteie, desenvolva
- O curso é o passo inicial para quem tem pouca ou nenhuma experiência
- Respeitar o próprio processo e vencer os medos', NULL, 1, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Formas de atuar: salão próprio, funcionária ou autônoma', 'Apostila p. 3-4', 'texto', 'A cabeleireira pode ser dona do próprio salão (mais decisões e lucro, mas muitas responsabilidades burocráticas, contábeis e trabalhistas), trabalhar no salão de terceiros (menos responsabilidade; negociar comissão, fixo e gastos com produtos) ou ser autônoma, atendendo em casa ou a domicílio (serviço personalizado, deve cobrar o deslocamento e pode se regularizar como MEI).

Pontos-chave:
- Dona do salão vira também empreendedora
- Funcionária: esclareça remuneração fixa, comissão e gastos com produto
- Autônoma: cobre o deslocamento e considere o MEI', NULL, 2, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Especialidades: colorista, cortes e penteados', 'Apostila p. 4-5', 'texto', 'A colorista domina colorimetria, alturas de tom, fundos de clareamento e reflexos, e precisa ser organizada e responsável. O especialista em cortes conhece ângulos, movimentos de tesoura, máquinas e navalhas, e precisa ser preciso, porque um corte errado não volta atrás. O especialista em penteados é criativo, pontual e domina escova, cachos e finalizadores.

Pontos-chave:
- Colorista: colorimetria + organização + responsabilidade
- Cortes: precisão e atenção ao desejo da cliente
- Penteados: criatividade, pontualidade e boa fixação', NULL, 3, true);
  INSERT INTO curso_provas (curso_id, modulo_id, salao_id, titulo, nota_minima, tentativas_maximas, embaralhar_perguntas, embaralhar_opcoes, mostrar_explicacao_apos_responder, mostrar_gabarito, ativo, ordem)
  VALUES (v_curso_id, v_modulo_id, v_salao_id, 'Quiz do módulo: A profissão e a metodologia Florescer', 70, NULL, false, true, true, 'sempre', true, 1)
  RETURNING id INTO v_prova_id;
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O que significa a filosofia FLORESÇA, da metodologia Aflor?', 'multipla_escolha', '[{"id":"a","texto":"Prospere, brilhe, distinga, patenteie, desenvolva"},{"id":"b","texto":"Foco, lucro, organização, rotina, estudo, sucesso, cuidado, amor"},{"id":"c","texto":"Força, liderança, otimismo, respeito, empatia, serviço, calma, alegria"},{"id":"d","texto":"É apenas o nome da escola, sem significado"}]'::jsonb, '"a"'::jsonb, 1, 1, 'A apostila define FLORESÇA como: Prospere, brilhe, distinga, patenteie, desenvolva!');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual destas é uma DIFICULDADE de ser dona do próprio salão?', 'multipla_escolha', '[{"id":"a","texto":"Não poder escolher os produtos"},{"id":"b","texto":"Ter muitas obrigações burocráticas, contábeis e trabalhistas"},{"id":"c","texto":"Não poder escolher a própria equipe"},{"id":"d","texto":"Ter sempre um lucro menor que o de funcionária"}]'::jsonb, '"b"'::jsonb, 1, 2, 'A dona do salão decide tudo, mas assume contas, estoque, funcionários e obrigações burocráticas e contábeis.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Por que a cabeleireira que atende a domicílio deve cobrar um pouco mais?', 'multipla_escolha', '[{"id":"a","texto":"Porque o serviço em casa é sempre mais demorado"},{"id":"b","texto":"Porque o preço precisa cobrir os gastos com deslocamento"},{"id":"c","texto":"Porque a cliente não paga taxa de salão"},{"id":"d","texto":"Porque é obrigatório por lei"}]'::jsonb, '"b"'::jsonb, 1, 3, 'O valor do serviço a domicílio deve cobrir os gastos com deslocamento.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual forma de regularização a apostila indica para a autônoma trabalhar com baixo custo?', 'multipla_escolha', '[{"id":"a","texto":"MEI (Microempreendedor Individual)"},{"id":"b","texto":"Sociedade anônima"},{"id":"c","texto":"Carteira assinada em salão"},{"id":"d","texto":"Não é preciso nenhuma regularização"}]'::jsonb, '"a"'::jsonb, 1, 4, 'Como MEI, a autônoma regulariza seu trabalho a um baixo custo.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O que a colorista PRECISA dominar?', 'multipla_escolha', '[{"id":"a","texto":"Somente cortes à navalha"},{"id":"b","texto":"Regras de colorimetria, alturas de tom, fundos de clareamento e reflexos"},{"id":"c","texto":"Apenas penteados para festas"},{"id":"d","texto":"Somente marketing digital"}]'::jsonb, '"b"'::jsonb, 1, 5, 'A colorista se especializa em colorações e mechas, por isso domina toda a colorimetria.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Por que o especialista em cortes precisa ser tão preciso?', 'multipla_escolha', '[{"id":"a","texto":"Porque corte é o serviço mais barato"},{"id":"b","texto":"Porque, quando erramos um corte, não tem como voltar atrás"},{"id":"c","texto":"Porque usa apenas máquina"},{"id":"d","texto":"Porque não precisa ouvir a cliente"}]'::jsonb, '"b"'::jsonb, 1, 6, 'Um corte errado não pode ser desfeito, então precisão e atenção ao desejo da cliente são fundamentais.');

  -- ===== Módulo 2: Marketing pessoal, digital e atendimento =====
  INSERT INTO curso_modulos (curso_id, salao_id, nome, descricao, ordem)
  VALUES (v_curso_id, v_salao_id, 'Marketing pessoal, digital e atendimento', 'Como construir sua imagem, usar as redes sociais a seu favor e atender como profissional de destaque.', 2)
  RETURNING id INTO v_modulo_id;
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'O que é marketing pessoal', 'Apostila p. 6', 'texto', 'Marketing pessoal é o conjunto de estratégias, planejadas e coerentes, que atribuem valor à sua imagem. Não é o mesmo que publicidade: a marca, aqui, é você. Tudo deve ser pensado como entrega de valor para as pessoas.

Pontos-chave:
- Marketing pessoal = atribuir valor à sua imagem
- Não confunda com publicidade
- O primeiro passo é se conhecer e saber a imagem que quer passar', NULL, 1, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Identidade e gratidão', 'Apostila p. 7', 'texto', 'No mercado de serviços você é praticamente o seu próprio produto, e a imagem que passa precisa estar de acordo com quem você é. Autoconhecimento, gratidão pelas pequenas conquistas, foco na evolução (não na perfeição) e saber dizer não fazem parte da sua identidade profissional.

Pontos-chave:
- Você é o seu próprio produto
- Busque evolução, não perfeição
- Não se compare; seja grata pelas pequenas conquistas', NULL, 2, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Marketing digital e planejamento', 'Apostila p. 8-9', 'texto', 'O consumidor de beleza está mais exigente. Comece pelo planejamento: pesquisa de mercado (clientes, concorrentes, ameaças e oportunidades, com base em dados e não em suposições) e definição de objetivos e metas, acompanhando indicadores como vendas e ticket médio.

Pontos-chave:
- Planejamento é o começo de tudo
- Pesquisa de mercado = decidir com dados
- Metas permitem acompanhar resultados', NULL, 3, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Redes sociais e marketing de relacionamento', 'Apostila p. 9-11', 'texto', 'Escolha as redes onde seu público está e que você consegue manter. O Instagram é visual e tem tudo a ver com salões; YouTube serve para tutoriais; Facebook para páginas e grupos de clientes; Pinterest para inspiração. Use as redes para conversar e criar relacionamento, não só para fazer propaganda. Para postar fotos de cliente, é obrigatório ter a autorização dela (direito de imagem).

Pontos-chave:
- Instagram: rede visual, ideal para salões
- Rede social é relacionamento, não só propaganda
- Foto de cliente só com autorização de uso de imagem
- Ideias de post: antes e depois, bastidores, mitos e verdades, vídeos curtos, promoções', NULL, 4, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Profissional de destaque e atendimento', 'Apostila p. 12', 'texto', 'Conheça seu público, a concorrência e os fornecedores. A cliente busca excelência, ser ouvida, dicas de cuidado e um atendimento cordial. Cuide da aparência, seja profissional (sem intimidade demais nem frieza), não fale de problemas pessoais, mantenha materiais limpos e organizados e higienize as mãos antes e depois de cada atendimento.

Pontos-chave:
- Ouça o desejo da cliente e dê dicas de manutenção
- Aparência impecável e materiais sempre limpos
- Nem intimidade demais, nem frieza', NULL, 5, true);
  INSERT INTO curso_provas (curso_id, modulo_id, salao_id, titulo, nota_minima, tentativas_maximas, embaralhar_perguntas, embaralhar_opcoes, mostrar_explicacao_apos_responder, mostrar_gabarito, ativo, ordem)
  VALUES (v_curso_id, v_modulo_id, v_salao_id, 'Quiz do módulo: Marketing pessoal, digital e atendimento', 70, NULL, false, true, true, 'sempre', true, 2)
  RETURNING id INTO v_prova_id;
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Em poucas palavras, o que é marketing pessoal?', 'multipla_escolha', '[{"id":"a","texto":"Fazer anúncios pagos nas redes"},{"id":"b","texto":"Atribuir valor à sua imagem"},{"id":"c","texto":"O mesmo que publicidade"},{"id":"d","texto":"Ter muitos seguidores"}]'::jsonb, '"b"'::jsonb, 1, 1, 'A apostila resume: marketing pessoal é atribuir valor à sua imagem, e não deve ser confundido com publicidade.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual é o primeiro passo do marketing pessoal?', 'multipla_escolha', '[{"id":"a","texto":"Comprar equipamentos caros"},{"id":"b","texto":"Se conhecer e conhecer a imagem que você quer passar"},{"id":"c","texto":"Copiar a concorrência"},{"id":"d","texto":"Abaixar os preços"}]'::jsonb, '"b"'::jsonb, 1, 2, 'O autoconhecimento vem antes de tudo: saber quem você é e que imagem quer transmitir.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Você fez uma transformação linda e quer postar a foto da cliente. O que é obrigatório?', 'multipla_escolha', '[{"id":"a","texto":"Nada, a foto é sua"},{"id":"b","texto":"Marcar a cliente na postagem"},{"id":"c","texto":"Ter a autorização da cliente para uso da imagem"},{"id":"d","texto":"Postar apenas nos Stories"}]'::jsonb, '"c"'::jsonb, 1, 3, 'Para divulgar fotos da cliente é obrigatório que ela autorize e libere o direito de imagem.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual é o erro mais comum de quem começa no marketing digital?', 'multipla_escolha', '[{"id":"a","texto":"Usar as redes sociais só como propaganda"},{"id":"b","texto":"Responder os comentários"},{"id":"c","texto":"Postar bastidores"},{"id":"d","texto":"Fazer pesquisa de mercado"}]'::jsonb, '"a"'::jsonb, 1, 4, 'Redes sociais servem para marketing de relacionamento: conversar e criar conexão, não só anunciar.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Para que serve a pesquisa de mercado?', 'multipla_escolha', '[{"id":"a","texto":"Para decidir com base em dados, e não em suposições"},{"id":"b","texto":"Para descobrir a senha do concorrente"},{"id":"c","texto":"Para escolher a cor do salão"},{"id":"d","texto":"Ela não é necessária para salões pequenos"}]'::jsonb, '"a"'::jsonb, 1, 5, 'A pesquisa estuda consumidores, concorrentes, ameaças e oportunidades para decidir com base em dados.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Durante o atendimento, a cliente começa a contar um problema pessoal. Qual é a postura recomendada?', 'multipla_escolha', '[{"id":"a","texto":"Dar sua opinião e contar os seus problemas também"},{"id":"b","texto":"Ouvir com educação, sem dar opinião nem falar de problemas pessoais"},{"id":"c","texto":"Pedir para ela parar de falar"},{"id":"d","texto":"Mudar de assunto com gírias"}]'::jsonb, '"b"'::jsonb, 1, 6, 'A apostila orienta tratar a cliente de forma profissional, sem falar de problemas pessoais nem opinar nos problemas dela.');

  -- ===== Módulo 3: Biossegurança =====
  INSERT INTO curso_modulos (curso_id, salao_id, nome, descricao, ordem)
  VALUES (v_curso_id, v_salao_id, 'Biossegurança', 'Normas da Vigilância Sanitária, EPIs e limpeza correta dos materiais para proteger você e a cliente.', 3)
  RETURNING id INTO v_modulo_id;
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Vigilância Sanitária e regras do espaço', 'Apostila p. 13-14', 'texto', 'A ANVISA cria e fiscaliza as normas de higiene e segurança. Ignorá-las coloca clientes e profissionais em risco de doenças como HIV, hepatite e micoses. O salão deve ser regularizado, separado da residência, ter local próprio para lavar material, ventilação e móveis com revestimento impermeável.

Pontos-chave:
- ANVISA cria e fiscaliza as normas
- Espaço separado da residência e ventilado
- Local próprio para lavagem de material', NULL, 1, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Regras para cabeleireiros', 'Apostila p. 14', 'texto', 'Se notar qualquer alteração no couro cabeludo ou na pele, oriente a cliente a procurar um médico. Não use química (tintura, alisamento) em quem tem lesão no couro cabeludo. Pentes, escovas e bobes são higienizados a cada cliente, e as toalhas são limpas e individuais.

Pontos-chave:
- Lesão no couro cabeludo = sem química
- Higienizar pentes, escovas e bobes a cada cliente
- Toalha limpa e individual para cada cliente', NULL, 2, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'EPIs: equipamentos de proteção individual', 'Apostila p. 14-15', 'texto', 'Óculos protegem os olhos ao manipular tinturas e alisamentos; máscaras evitam inalar gases químicos. Luvas protegem do contato com químicos e fluidos corporais; aventais devem ser impermeáveis e resistentes. Use sempre sapatos fechados.

Pontos-chave:
- Óculos e máscara: cabeça
- Luvas e avental impermeável: membros superiores
- Sapato fechado: membros inferiores', NULL, 3, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Limpeza dos materiais', 'Apostila p. 15', 'texto', 'A limpeza vem antes de qualquer desinfecção ou esterilização, porque resíduos impedem a ação do produto. Use escovas de cerdas macias, nunca palha de aço. Enxágue em água potável e corrente, e seque com pano limpo ou papel toalha: o material deve estar rigorosamente limpo e seco antes de esterilizar.

Pontos-chave:
- Limpar antes de desinfetar/esterilizar
- Nunca usar materiais abrasivos
- Material limpo e seco antes da esterilização', NULL, 4, true);
  INSERT INTO curso_provas (curso_id, modulo_id, salao_id, titulo, nota_minima, tentativas_maximas, embaralhar_perguntas, embaralhar_opcoes, mostrar_explicacao_apos_responder, mostrar_gabarito, ativo, ordem)
  VALUES (v_curso_id, v_modulo_id, v_salao_id, 'Quiz do módulo: Biossegurança', 70, NULL, false, true, true, 'sempre', true, 3)
  RETURNING id INTO v_prova_id;
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual órgão cria e fiscaliza as normas de higiene e segurança dos salões?', 'multipla_escolha', '[{"id":"a","texto":"Procon"},{"id":"b","texto":"ANVISA (Agência Nacional de Vigilância Sanitária)"},{"id":"c","texto":"Receita Federal"},{"id":"d","texto":"Sindicato dos cabeleireiros"}]'::jsonb, '"b"'::jsonb, 1, 1, 'A ANVISA é o órgão que cria e fiscaliza essas normas.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Uma cliente com uma ferida no couro cabeludo pede uma coloração. O que fazer?', 'multipla_escolha', '[{"id":"a","texto":"Aplicar normalmente, com cuidado"},{"id":"b","texto":"Aplicar só na metade do cabelo"},{"id":"c","texto":"Não aplicar química e orientar que procure um médico"},{"id":"d","texto":"Aplicar e passar um creme por cima da ferida"}]'::jsonb, '"c"'::jsonb, 1, 2, 'Não se usa química em quem tem lesão no couro cabeludo, e a profissional deve orientar a cliente a procurar um médico.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Com que frequência pentes, escovas e bobes devem ser higienizados?', 'multipla_escolha', '[{"id":"a","texto":"Uma vez por semana"},{"id":"b","texto":"A cada cliente"},{"id":"c","texto":"Uma vez por mês"},{"id":"d","texto":"Só quando estiverem visivelmente sujos"}]'::jsonb, '"b"'::jsonb, 1, 3, 'Esses materiais devem ser higienizados a cada cliente.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual EPI protege os olhos ao manipular tinturas e alisamentos?', 'multipla_escolha', '[{"id":"a","texto":"Avental"},{"id":"b","texto":"Luvas"},{"id":"c","texto":"Óculos"},{"id":"d","texto":"Sapato fechado"}]'::jsonb, '"c"'::jsonb, 1, 4, 'Os óculos preservam os olhos durante a manipulação de produtos químicos.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O que NUNCA deve ser usado para limpar os materiais?', 'multipla_escolha', '[{"id":"a","texto":"Escova de cerdas macias"},{"id":"b","texto":"Água potável corrente"},{"id":"c","texto":"Palha de aço ou outro material abrasivo"},{"id":"d","texto":"Papel toalha para secar"}]'::jsonb, '"c"'::jsonb, 1, 5, 'Materiais abrasivos, como palha de aço, danificam a superfície dos materiais.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Como o material deve estar antes de ir para a esterilização?', 'multipla_escolha', '[{"id":"a","texto":"Molhado, para o produto agir melhor"},{"id":"b","texto":"Rigorosamente limpo e seco"},{"id":"c","texto":"Com resto de produto, que ajuda a esterilizar"},{"id":"d","texto":"Não importa"}]'::jsonb, '"b"'::jsonb, 1, 6, 'A umidade e os resíduos interferem na esterilização, por isso o material deve estar limpo e seco.');

  -- ===== Módulo 4: Anatomia e tricologia =====
  INSERT INTO curso_modulos (curso_id, salao_id, nome, descricao, ordem)
  VALUES (v_curso_id, v_salao_id, 'Anatomia e tricologia', 'Pele, pelo, ciclo de crescimento, estrutura do fio e suas propriedades: a base para qualquer química.', 4)
  RETURNING id INTO v_modulo_id;
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'As camadas da pele', 'Apostila p. 16', 'texto', 'A epiderme é a camada mais externa e dá origem a unhas, pelos e glândulas. A derme fica no meio e dá resistência e elasticidade (colágeno, vasos e nervos). A hipoderme é a mais profunda, com células de gordura que protegem contra traumas.

Pontos-chave:
- Epiderme: mais externa
- Derme: resistência e elasticidade
- Hipoderme: mais profunda, gordura', NULL, 1, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'O pelo e o ciclo capilar', 'Apostila p. 17-19', 'texto', 'A cabeça tem em média 100.000 folículos. Existem pelos velo (penugem) e terminais (cabelo, barba). O ciclo do fio tem as fases anágena (crescimento, de 2 a 6 anos; o comprimento máximo é genético), catágena (atividade reduzida, 2 a 3 semanas) e telógena (o fio se solta e cai). Depois o ciclo recomeça.

Pontos-chave:
- Cerca de 100.000 folículos na cabeça
- Anágena = crescimento (2 a 6 anos)
- Catágena = 2 a 3 semanas; telógena = queda', NULL, 2, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Tricologia e estrutura do fio', 'Apostila p. 20-21', 'texto', 'Tricologia é o estudo dos pelos e cabelos (do grego thricos + logos). O fio tem haste (parte visível) e raiz. O formato da raiz define a curvatura: redonda = liso, ovalada = ondulado, achatada = crespo. Em corte, o fio tem cutícula (escamas externas que protegem), córtex (onde ficam a melanina e onde acontecem os processos químicos) e medula (centro).

Pontos-chave:
- Raiz redonda = liso; ovalada = ondulado; achatada = crespo
- Cutícula danificada = cabelo áspero e sem brilho
- Córtex: cor, elasticidade e processos químicos', NULL, 3, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Composição química e propriedades do cabelo', 'Apostila p. 21-22', 'texto', 'O cabelo é formado principalmente por queratina, rica em cistina, cujas pontes de enxofre dão forma e elasticidade ao fio. As propriedades são espessura, elasticidade, permeabilidade (absorve até 35% do peso em água), textura e densidade (quantidade de fios por cm²).

Pontos-chave:
- Queratina: principal proteína
- Pontes de enxofre (cistina) dão forma ao fio
- Densidade = fios por cm², não textura', NULL, 4, true);
  INSERT INTO curso_provas (curso_id, modulo_id, salao_id, titulo, nota_minima, tentativas_maximas, embaralhar_perguntas, embaralhar_opcoes, mostrar_explicacao_apos_responder, mostrar_gabarito, ativo, ordem)
  VALUES (v_curso_id, v_modulo_id, v_salao_id, 'Quiz do módulo: Anatomia e tricologia', 70, NULL, false, true, true, 'sempre', true, 4)
  RETURNING id INTO v_prova_id;
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual é a camada mais externa da pele?', 'multipla_escolha', '[{"id":"a","texto":"Derme"},{"id":"b","texto":"Hipoderme"},{"id":"c","texto":"Epiderme"},{"id":"d","texto":"Medula"}]'::jsonb, '"c"'::jsonb, 1, 1, 'A epiderme é a camada mais externa e dá origem aos pelos, unhas e glândulas.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'A fase anágena do ciclo do cabelo é a fase de:', 'multipla_escolha', '[{"id":"a","texto":"Queda"},{"id":"b","texto":"Crescimento, que dura de 2 a 6 anos"},{"id":"c","texto":"Repouso de 2 semanas"},{"id":"d","texto":"Descoloração"}]'::jsonb, '"b"'::jsonb, 1, 2, 'Na fase anágena o fio está sendo produzido continuamente, por 2 a 6 anos.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Em qual camada do fio acontecem os processos químicos (coloração, alisamento)?', 'multipla_escolha', '[{"id":"a","texto":"Cutícula"},{"id":"b","texto":"Córtex"},{"id":"c","texto":"Medula"},{"id":"d","texto":"Epiderme"}]'::jsonb, '"b"'::jsonb, 1, 3, 'O córtex é o ''coração'' da fibra capilar, onde ficam a melanina e onde se desenvolvem os processos químicos.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Uma raiz de formato achatado produz um cabelo:', 'multipla_escolha', '[{"id":"a","texto":"Liso"},{"id":"b","texto":"Ondulado"},{"id":"c","texto":"Crespo"},{"id":"d","texto":"Sem cor"}]'::jsonb, '"c"'::jsonb, 1, 4, 'Raiz redonda = liso, ovalada = ondulado, achatada = crespo.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual é a principal proteína do cabelo?', 'multipla_escolha', '[{"id":"a","texto":"Colágeno"},{"id":"b","texto":"Queratina"},{"id":"c","texto":"Melanina"},{"id":"d","texto":"Elastina"}]'::jsonb, '"b"'::jsonb, 1, 5, 'O cabelo é composto em grande parte por queratina, rica em cistina.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O que acontece quando a cutícula é danificada por químicas e calor?', 'multipla_escolha', '[{"id":"a","texto":"O cabelo fica mais brilhante"},{"id":"b","texto":"O cabelo fica áspero e sem brilho"},{"id":"c","texto":"O cabelo cresce mais rápido"},{"id":"d","texto":"Nada muda"}]'::jsonb, '"b"'::jsonb, 1, 6, 'A cutícula protege o fio; danificada, deixa o cabelo áspero e sem brilho.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O que é a DENSIDADE do cabelo?', 'multipla_escolha', '[{"id":"a","texto":"A espessura de cada fio"},{"id":"b","texto":"A quantidade de fios por cm²"},{"id":"c","texto":"A cor do cabelo"},{"id":"d","texto":"O comprimento máximo"}]'::jsonb, '"b"'::jsonb, 1, 7, 'Densidade é a quantidade de fios por cm², e não tem relação com a textura.');

  -- ===== Módulo 5: Colorimetria =====
  INSERT INTO curso_modulos (curso_id, salao_id, nome, descricao, ordem)
  VALUES (v_curso_id, v_salao_id, 'Colorimetria', 'Da melanina à numeração da tinta: estrela de cores, altura de tom, fundo de clareamento, oxidantes e cálculo de base.', 5)
  RETURNING id INTO v_modulo_id;
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'A origem da cor: as melaninas', 'Apostila p. 23-24', 'texto', 'A cor natural vem da melanina no córtex. A eumelanina (pigmentos escuros, do preto ao vermelho-escuro) é granulada, mais difícil de cobrir, porém mais fácil de retirar no clareamento. A feomelanina (do vermelho ao amarelo) é difusa, fácil de cobrir, mas mais difícil de retirar. Com a idade, a produção de melanina diminui e surgem os brancos.

Pontos-chave:
- Eumelanina: escura, sai mais fácil no clareamento
- Feomelanina: clara, mais difícil de retirar
- Brancos = interrupção da produção de melanina', NULL, 1, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Por que calcular as cores', 'Apostila p. 25-27', 'texto', 'A colorimetria capilar serve para identificar cores naturais, combinar tons e neutralizar. Calcular certo garante cabelos mais saudáveis (menos correções químicas), menos erros e economia de produto, porque as sobras de tinta podem ser aproveitadas.

Pontos-chave:
- Menos correção = cabelo mais saudável
- Menos chance de erro
- Economia de produto', NULL, 2, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'A estrela de Oswald: primárias, secundárias e terciárias', 'Apostila p. 28-38', 'texto', 'Primárias: vermelho, azul e amarelo. A soma das três dá marrom. Secundárias: verde (azul + amarelo), laranja (vermelho + amarelo) e roxo (azul + vermelho). Terciárias: mistura de primária com secundária (ex.: amarelo + laranja = amarelo-alaranjado). Cores opostas na estrela se anulam, e é assim que neutralizamos um tom indesejado.

Pontos-chave:
- Primárias juntas = marrom
- Verde = azul + amarelo; laranja = vermelho + amarelo; roxo = azul + vermelho
- Cor oposta na estrela neutraliza', NULL, 3, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Altura de tom', 'Apostila p. 39-43', 'texto', 'Altura de tom é o quanto o cabelo está claro ou escuro, natural ou colorido. Escala: 1 preto, 2 preto, 3 castanho escuro, 4 castanho médio, 5 castanho claro, 6 loiro escuro, 7 loiro médio, 8 loiro claro, 9 loiro muito claro (algumas marcas vão até 12). Na tinta, é o número ANTES do ponto: em 6.1, o 6 é loiro escuro.

Pontos-chave:
- Número antes do ponto = altura de tom
- Tons 1 a 4: predomina eumelanina
- Algumas marcas vão até 12', NULL, 4, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Fundo de clareamento', 'Apostila p. 43-45', 'texto', 'Fundo de clareamento é a cor que se revela quando o cabelo é descolorido (ex.: tom 5 = vermelho, tom 7 = laranja, tom 9 = amarelo). Conhecê-lo permite adicionar a cor que falta para neutralizar, escurecer, clarear ou direcionar o reflexo. A avaliação prévia é feita com teste de mecha (oxidante + pó descolorante). O pó descolorante pode clarear até 8 tons.

Pontos-chave:
- Fundo de clareamento = cor que aparece ao descolorir
- Teste de mecha antes de clarear
- Pó descolorante: até 8 tons', NULL, 5, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Cores quentes e frias', 'Apostila p. 29, 46', 'texto', 'Quentes: dourado, acobreado, chocolate, avermelhado (sobressai o laranja, vermelho e amarelo). Frias: tabaco, acinzentado, perolado, platinado (sobressai o azul, verde e roxo). Neutras: mistura de quentes e frias, menos vibrantes.

Pontos-chave:
- Quentes: dourado, acobreado, avermelhado
- Frias: acinzentado, perolado, platinado
- Neutras: mistura das duas', NULL, 6, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Água oxigenada e volumes', 'Apostila p. 31, 47-48', 'texto', 'A água oxigenada (peróxido de hidrogênio) libera oxigênio e causa a oxidação; com o amoníaco da coloração, extrai melanina e clareia. 10 volumes (3%) praticamente só tonaliza; 30 volumes (9%) clareia de 2 a 3 tons. Volumes maiores clareiam mais, mas agridem mais. A descoloração é a última opção e pede tratamento depois.

Pontos-chave:
- O OX é o responsável pelo clareamento
- 10 vol: tonaliza / banho de brilho
- 30 vol: 2 a 3 tons', NULL, 7, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Reflexos: lendo a numeração da tinta', 'Apostila p. 50-51', 'texto', 'O número depois do ponto é o reflexo: .1 cinza, .2 irisado, .3 dourado, .4 acobreado, .5 acaju, .6 vermelho, .7 esverdeado. Com dois dígitos, o primeiro reflexo é o mais aparente e o segundo é nuance. Ex.: 8.35 = loiro claro dourado com nuance acaju.

Pontos-chave:
- Depois do ponto = reflexo
- .1 cinza, .3 dourado, .4 acobreado, .5 acaju
- Primeiro dígito do reflexo é o mais aparente', NULL, 8, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Calculando os tons de base', 'Apostila p. 52', 'texto', 'Para chegar a uma base, some as alturas de tom e divida pela quantidade de cores misturadas, sempre em quantidades iguais. Ex.: 8 + 4 = 12 ÷ 2 = 6 (loiro escuro). O reflexo é direcionado com intensificadores (cinza, dourado, irisado, mate, cobre).

Pontos-chave:
- Soma das bases ÷ número de cores
- Misturas sempre em quantidades iguais
- Reflexo vem dos intensificadores', NULL, 9, true);
  INSERT INTO curso_provas (curso_id, modulo_id, salao_id, titulo, nota_minima, tentativas_maximas, embaralhar_perguntas, embaralhar_opcoes, mostrar_explicacao_apos_responder, mostrar_gabarito, ativo, ordem)
  VALUES (v_curso_id, v_modulo_id, v_salao_id, 'Quiz do módulo: Colorimetria', 70, NULL, false, true, true, 'sempre', true, 5)
  RETURNING id INTO v_prova_id;
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual cor resulta da mistura das três cores primárias?', 'multipla_escolha', '[{"id":"a","texto":"Branco"},{"id":"b","texto":"Marrom"},{"id":"c","texto":"Verde"},{"id":"d","texto":"Preto azulado"}]'::jsonb, '"b"'::jsonb, 1, 1, 'Vermelho + azul + amarelo = marrom.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual é a mistura que forma o VERDE?', 'multipla_escolha', '[{"id":"a","texto":"Vermelho + amarelo"},{"id":"b","texto":"Azul + vermelho"},{"id":"c","texto":"Azul + amarelo"},{"id":"d","texto":"Vermelho + verde"}]'::jsonb, '"c"'::jsonb, 1, 2, 'Verde é a junção de azul com amarelo.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Em uma tinta 6.1, o que significam os números?', 'multipla_escolha', '[{"id":"a","texto":"6 = reflexo e 1 = altura de tom"},{"id":"b","texto":"6 = loiro escuro (altura de tom) e 1 = reflexo cinza"},{"id":"c","texto":"6 = volumes do OX e 1 = tempo de pausa"},{"id":"d","texto":"6 = castanho e 1 = dourado"}]'::jsonb, '"b"'::jsonb, 1, 3, 'Antes do ponto vem a altura de tom (6 = loiro escuro); depois do ponto vem o reflexo (.1 = cinza).');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O que é o fundo de clareamento?', 'multipla_escolha', '[{"id":"a","texto":"A cor que se revela quando o cabelo é descolorido"},{"id":"b","texto":"A cor do tubo da tinta"},{"id":"c","texto":"O xampu usado antes da química"},{"id":"d","texto":"A cor da pele da cliente"}]'::jsonb, '"a"'::jsonb, 1, 4, 'Fundo de clareamento é o resíduo de cor que aparece ao descolorir os fios.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'A água oxigenada de 10 volumes, misturada à coloração, serve principalmente para:', 'multipla_escolha', '[{"id":"a","texto":"Clarear 4 tons"},{"id":"b","texto":"Tonalizar / banho de brilho"},{"id":"c","texto":"Alisar o cabelo"},{"id":"d","texto":"Descolorir até o platinado"}]'::jsonb, '"b"'::jsonb, 1, 5, 'Com 10 volumes a fixação de cor é pequena e a tinta age como tonalizante ou banho de brilho.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Misturando partes iguais de uma base 8 e uma base 4, qual altura de tom você obtém?', 'multipla_escolha', '[{"id":"a","texto":"5"},{"id":"b","texto":"6"},{"id":"c","texto":"7"},{"id":"d","texto":"12"}]'::jsonb, '"b"'::jsonb, 1, 6, '8 + 4 = 12; 12 ÷ 2 = 6 (loiro escuro).');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Como neutralizamos um tom indesejado segundo a estrela colorimétrica?', 'multipla_escolha', '[{"id":"a","texto":"Usando a mesma cor em dobro"},{"id":"b","texto":"Usando a cor oposta a ele na estrela"},{"id":"c","texto":"Lavando com xampu anti-resíduo"},{"id":"d","texto":"Aplicando mais OX"}]'::jsonb, '"b"'::jsonb, 1, 7, 'Na estrela, cores opostas se anulam; por isso usamos a oposta para neutralizar.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual reflexo é representado pelo número .3?', 'multipla_escolha', '[{"id":"a","texto":"Cinza"},{"id":"b","texto":"Acobreado"},{"id":"c","texto":"Dourado"},{"id":"d","texto":"Vermelho"}]'::jsonb, '"c"'::jsonb, 1, 8, '.1 cinza, .2 irisado, .3 dourado, .4 acobreado, .5 acaju, .6 vermelho, .7 esverdeado.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Antes de clarear o cabelo de uma cliente, qual avaliação prévia é necessária?', 'multipla_escolha', '[{"id":"a","texto":"Teste de mecha com oxidante e pó descolorante"},{"id":"b","texto":"Perguntar a idade"},{"id":"c","texto":"Medir o comprimento do cabelo"},{"id":"d","texto":"Nenhuma"}]'::jsonb, '"a"'::jsonb, 1, 9, 'A avaliação prévia é feita com teste de mecha, com peróxido de hidrogênio e pó descolorante.');

  -- ===== Módulo 6: pH e química capilar =====
  INSERT INTO curso_modulos (curso_id, salao_id, nome, descricao, ordem)
  VALUES (v_curso_id, v_salao_id, 'pH e química capilar', 'pH do fio, alisamentos com hidróxidos e tioglicolato, cisteína, os riscos do formol e a queratinização.', 6)
  RETURNING id INTO v_modulo_id;
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'O pH do cabelo', 'Apostila p. 53-55', 'texto', 'pH é a escala de 0 a 14 que mede se algo é ácido (abaixo de 7), neutro (7) ou alcalino (acima de 7). O cabelo é ácido, entre 4,5 e 5,5. Colorações e luzes são alcalinas e abrem as escamas, deixando o fio poroso e sem brilho; progressivas muito ácidas enrijecem e quebram. Para recuperar, use produtos de pH ácido e cronograma capilar.

Pontos-chave:
- Cabelo: pH ácido, de 4,5 a 5,5
- 7 = neutro; abaixo = ácido; acima = alcalino
- Químicas alcalinas abrem a cutícula', NULL, 1, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Alisamento com hidróxidos', 'Apostila p. 56-58', 'texto', 'Hidróxido de sódio (pH 13): potente, pode queimar o couro cabeludo e exige alto conhecimento técnico. Guanidina (pH ~12): mistura de dois componentes, sem lixívia, indicada para cabelos afro, mas pode emborrachar. Lítio: mais lento e suave. Sempre faça teste de mecha, proteja totalmente o couro cabeludo, use luvas e avental, preserve a raiz e trate a fibra depois. Retoque só após 120 dias.

Pontos-chave:
- Teste de mecha e proteção total do couro cabeludo
- Incompatível com henê, sais metálicos e alisamentos ácidos
- Retoque só após 120 dias', NULL, 2, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Tioglicolato de amônia', 'Apostila p. 59-64', 'texto', 'Alcalino (pH 10 a 11,5), rompe as ligações do fio e precisa de neutralizante (à base de peróxido) para refazer as pontes de cistina. Indicado para ondulados, volumosos ou levemente cacheados, inclusive coloridos. Nunca combinar com outras bases alisantes. Aplicar a partir da nuca, a pelo menos 1 cm da raiz, fazendo teste do nó a cada 10 minutos (ação de 5 a 45 min). A cliente espera 72 horas para lavar e prender; coloração só após 7 a 15 dias.

Pontos-chave:
- Nunca misturar com outras bases alisantes
- Teste do nó a cada 10 minutos
- Neutralizante é obrigatório
- Colorir só após 7 a 15 dias', NULL, 3, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Cistina, cisteína e carbocisteína', 'Apostila p. 65-67', 'texto', 'A cistina, rica em enxofre, une as cadeias de queratina. A cisteína alinha, dá brilho, fortalece e reestrutura. A escova de carbocisteína é uma progressiva que usa aminoácidos no lugar do formol. Passo a passo: lavar com xampu purificante, secar, dividir em 4, aplicar mecha a mecha, pausa de 20 min, escovar sem enxaguar, esfriar 10 min, enxaguar e aplicar o selante.

Pontos-chave:
- Cistina une as cadeias de queratina
- Carbocisteína = progressiva sem formol
- Nunca ultrapassar o tempo de pausa', NULL, 4, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Formol: por que não usar', 'Apostila p. 68-72', 'texto', 'A ANVISA não permite nenhuma dosagem de formol como alisante (só 0,2% como conservante e até 5% em endurecedor de unhas). Ele é considerado cancerígeno, causa queda, alergias, irritação e queimaduras, e cria uma película que impede tratamentos. Com a chapinha vira vapor: atinge primeiro os olhos, depois as vias respiratórias e a pele.

Pontos-chave:
- Formol como alisante é proibido pela ANVISA
- Vapor atinge primeiro os olhos
- Risco para a cliente E para a profissional', NULL, 5, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Queratinização', 'Apostila p. 73', 'texto', 'Também chamada de cauterização capilar, repõe a queratina perdida com sol, poluição e químicas. Deixa o fio mais forte, devolve a elasticidade, protege e repara a fibra, e traz maciez e brilho.

Pontos-chave:
- Repõe proteína (queratina)
- Recupera elasticidade e força
- Indicada após químicas', NULL, 6, true);
  INSERT INTO curso_provas (curso_id, modulo_id, salao_id, titulo, nota_minima, tentativas_maximas, embaralhar_perguntas, embaralhar_opcoes, mostrar_explicacao_apos_responder, mostrar_gabarito, ativo, ordem)
  VALUES (v_curso_id, v_modulo_id, v_salao_id, 'Quiz do módulo: pH e química capilar', 70, NULL, false, true, true, 'sempre', true, 6)
  RETURNING id INTO v_prova_id;
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual é o pH natural do cabelo?', 'multipla_escolha', '[{"id":"a","texto":"Alcalino, entre 9 e 10"},{"id":"b","texto":"Neutro, 7"},{"id":"c","texto":"Ácido, entre 4,5 e 5,5"},{"id":"d","texto":"Muito alcalino, 14"}]'::jsonb, '"c"'::jsonb, 1, 1, 'O pH capilar é ácido, em torno de 4,5 a 5,5.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Na escala de pH, o número 7 indica:', 'multipla_escolha', '[{"id":"a","texto":"Ácido"},{"id":"b","texto":"Neutro"},{"id":"c","texto":"Alcalino"},{"id":"d","texto":"Tóxico"}]'::jsonb, '"b"'::jsonb, 1, 2, '7 é o ponto neutro; abaixo é ácido e acima é alcalino.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Por que colorações e luzes deixam o cabelo poroso e sem brilho?', 'multipla_escolha', '[{"id":"a","texto":"Porque têm pH alcalino e abrem as escamas"},{"id":"b","texto":"Porque têm pH ácido e fecham as escamas"},{"id":"c","texto":"Porque têm formol"},{"id":"d","texto":"Porque são aplicadas frias"}]'::jsonb, '"a"'::jsonb, 1, 3, 'Produtos alcalinos abrem as escamas da cutícula, deixando o fio poroso, áspero e sem brilho.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Depois de quanto tempo pode ser feito o retoque de um alisamento com hidróxido?', 'multipla_escolha', '[{"id":"a","texto":"15 dias"},{"id":"b","texto":"30 dias"},{"id":"c","texto":"120 dias (cerca de 4 meses)"},{"id":"d","texto":"1 ano"}]'::jsonb, '"c"'::jsonb, 1, 4, 'O retoque de alisamento à base de hidróxido só pode ser feito após 120 dias.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O tioglicolato de amônia pode ser combinado com outras bases alisantes?', 'multipla_escolha', '[{"id":"a","texto":"Sim, sempre"},{"id":"b","texto":"Sim, se for no mesmo dia"},{"id":"c","texto":"Não, há risco de emborrachamento e quebra"},{"id":"d","texto":"Só com formol"}]'::jsonb, '"c"'::jsonb, 1, 5, 'O uso do tioglicolato deve ser exclusivo; misturar bases causa emborrachamento e até quebra.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Durante a pausa do tioglicolato, qual teste é feito a cada 10 minutos?', 'multipla_escolha', '[{"id":"a","texto":"Teste de cor"},{"id":"b","texto":"Teste do nó"},{"id":"c","texto":"Teste de pH"},{"id":"d","texto":"Teste de alergia"}]'::jsonb, '"b"'::jsonb, 1, 6, 'A profissional acompanha de perto fazendo o teste do nó a cada 10 minutos.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Segundo a ANVISA, qual dosagem de formol é permitida como alisante?', 'multipla_escolha', '[{"id":"a","texto":"Até 0,2%"},{"id":"b","texto":"Até 5%"},{"id":"c","texto":"Nenhuma"},{"id":"d","texto":"Qualquer uma, se for importado"}]'::jsonb, '"c"'::jsonb, 1, 7, 'A ANVISA não permite nenhuma dosagem de formol com finalidade alisante.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O que é a escova de carbocisteína?', 'multipla_escolha', '[{"id":"a","texto":"Uma progressiva com formol"},{"id":"b","texto":"Uma progressiva que usa aminoácidos no lugar do formol"},{"id":"c","texto":"Um tipo de coloração"},{"id":"d","texto":"Um corte de cabelo"}]'::jsonb, '"b"'::jsonb, 1, 8, 'Ela nasceu para reduzir volume sem formol, usando aminoácidos derivados da cisteína.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'A queratinização (cauterização) serve para:', 'multipla_escolha', '[{"id":"a","texto":"Descolorir o cabelo"},{"id":"b","texto":"Repor a proteína (queratina) perdida pelos fios"},{"id":"c","texto":"Alisar com formol"},{"id":"d","texto":"Abrir a cutícula"}]'::jsonb, '"b"'::jsonb, 1, 9, 'A queratinização repõe a queratina perdida com sol, poluição e químicas.');

  -- ===== Módulo 7: Corte e visagismo =====
  INSERT INTO curso_modulos (curso_id, salao_id, nome, descricao, ordem)
  VALUES (v_curso_id, v_salao_id, 'Corte e visagismo', 'Como identificar o formato do rosto, o corte ideal para cada um e os ângulos e linhas de corte.', 7)
  RETURNING id INTO v_modulo_id;
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Identificando o tipo de rosto', 'Apostila p. 74', 'texto', 'Analise o perímetro (contorno do couro cabeludo até o queixo), compare a largura da testa com a do queixo, observe as bochechas e a distância dos olhos. Isso ajuda a enxergar qual figura geométrica o rosto lembra.

Pontos-chave:
- Observe o contorno do rosto
- Compare testa x queixo
- Observe bochechas e distância dos olhos', NULL, 1, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Visagismo e o corte ideal para cada rosto', 'Apostila p. 74-76', 'texto', 'Visagismo é a arte de criar uma imagem pessoal que revela as qualidades interiores da pessoa, usando corte, cor, penteado e maquiagem. Redondo: camadas emoldurando e comprimento abaixo do queixo. Oval: combina com quase tudo. Triangular: franja lateral na altura dos olhos e bob mais longo na frente. Quadrado: camadas compridas, franjas finas e risca lateral; evitar franja pesada e volume em coroa.

Pontos-chave:
- Oval: praticamente todos os cortes
- Redondo: alongar com camadas
- Quadrado: suavizar ângulos, evitar franja pesada', NULL, 2, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Ângulos de corte', 'Apostila p. 77', 'texto', 'A elevação é medida em relação ao chão, não à cabeça. 0° = base reta. 45° = camadas que dão leveza à base. 90° = camadas marcadas. 135° = camadas marcadas com graduação. 180° = camadas alongadas.

Pontos-chave:
- Elevação sempre em relação ao chão
- 0° base reta; 90° camadas marcadas
- 180° camadas alongadas', NULL, 3, true);
  INSERT INTO curso_aulas (modulo_id, curso_id, salao_id, titulo, descricao, tipo_conteudo, texto_conteudo, video_url, ordem, obrigatoria)
  VALUES (v_modulo_id, v_curso_id, v_salao_id, 'Linhas de corte', 'Apostila p. 78', 'texto', 'Junto aos ângulos, as linhas definem o resultado: horizontal forma base reta, vertical forma camadas marcadas e diagonal forma camadas marcadas com graduação e leveza.

Pontos-chave:
- Horizontal = base reta
- Vertical = camadas marcadas
- Diagonal = graduação e leveza', NULL, 4, true);
  INSERT INTO curso_provas (curso_id, modulo_id, salao_id, titulo, nota_minima, tentativas_maximas, embaralhar_perguntas, embaralhar_opcoes, mostrar_explicacao_apos_responder, mostrar_gabarito, ativo, ordem)
  VALUES (v_curso_id, v_modulo_id, v_salao_id, 'Quiz do módulo: Corte e visagismo', 70, NULL, false, true, true, 'sempre', true, 7)
  RETURNING id INTO v_prova_id;
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O que é visagismo?', 'multipla_escolha', '[{"id":"a","texto":"Uma técnica de alisamento"},{"id":"b","texto":"A arte de criar uma imagem pessoal que revela as qualidades interiores da pessoa"},{"id":"c","texto":"Um tipo de tesoura"},{"id":"d","texto":"Um tratamento de queratina"}]'::jsonb, '"b"'::jsonb, 1, 1, 'Visagismo usa corte, cor, penteado e maquiagem para criar uma imagem que revela quem a pessoa é.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual formato de rosto combina com praticamente todos os cortes?', 'multipla_escolha', '[{"id":"a","texto":"Redondo"},{"id":"b","texto":"Quadrado"},{"id":"c","texto":"Oval"},{"id":"d","texto":"Triangular"}]'::jsonb, '"c"'::jsonb, 1, 2, 'Quem tem rosto oval pode usar curto, médio ou longo, com ou sem franja.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Para uma cliente de rosto redondo, o que a apostila recomenda?', 'multipla_escolha', '[{"id":"a","texto":"Bob exatamente na altura do queixo"},{"id":"b","texto":"Franja desfiada curta"},{"id":"c","texto":"Camadas emoldurando o rosto e comprimento maior que a altura do rosto"},{"id":"d","texto":"Volume nas laterais"}]'::jsonb, '"c"'::jsonb, 1, 3, 'Camadas emoldurando e um comprimento maior ajudam a alongar o rosto redondo.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'A elevação da mecha no corte é medida em relação a quê?', 'multipla_escolha', '[{"id":"a","texto":"À cabeça da cliente"},{"id":"b","texto":"Ao chão"},{"id":"c","texto":"Ao espelho"},{"id":"d","texto":"À tesoura"}]'::jsonb, '"b"'::jsonb, 1, 4, 'A regra é simples: a elevação é em relação ao chão, não à cabeça.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Cortar com as pontas apontadas para o chão (0°) resulta em:', 'multipla_escolha', '[{"id":"a","texto":"Base reta"},{"id":"b","texto":"Camadas alongadas"},{"id":"c","texto":"Camadas marcadas"},{"id":"d","texto":"Repicado"}]'::jsonb, '"a"'::jsonb, 1, 5, '0° de elevação forma uma base reta.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual resultado o corte com elevação de 90° produz?', 'multipla_escolha', '[{"id":"a","texto":"Base reta"},{"id":"b","texto":"Camadas marcadas"},{"id":"c","texto":"Camadas alongadas"},{"id":"d","texto":"Nenhuma camada"}]'::jsonb, '"b"'::jsonb, 1, 6, 'A 90° as mechas ficam paralelas ao chão e formam camadas marcadas.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'A linha de corte DIAGONAL forma:', 'multipla_escolha', '[{"id":"a","texto":"Base reta"},{"id":"b","texto":"Camadas marcadas com graduação e leveza"},{"id":"c","texto":"Apenas franja"},{"id":"d","texto":"Corte assimétrico obrigatório"}]'::jsonb, '"b"'::jsonb, 1, 7, 'Horizontal = base reta; vertical = camadas marcadas; diagonal = camadas com graduação e leveza.');

  -- ===== Prova final =====
  INSERT INTO curso_provas (curso_id, modulo_id, salao_id, titulo, nota_minima, tentativas_maximas, embaralhar_perguntas, embaralhar_opcoes, mostrar_explicacao_apos_responder, mostrar_gabarito, ativo, ordem)
  VALUES (v_curso_id, NULL, v_salao_id, 'Prova final: Cabeleireiro Feminino Profissional', 70, 3, true, true, false, 'apos_aprovar_ou_esgotar', true, 99)
  RETURNING id INTO v_prova_id;
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Uma cliente com henê no cabelo pede alisamento com tioglicolato. O que fazer?', 'multipla_escolha', '[{"id":"a","texto":"Aplicar normalmente"},{"id":"b","texto":"Não fazer: henê é incompatível com tioglicolato"},{"id":"c","texto":"Aplicar só na raiz"},{"id":"d","texto":"Aplicar e dobrar o tempo de pausa"}]'::jsonb, '"b"'::jsonb, 1, 1, 'Cabelos com henê, hena ou colorações com bases metálicas não podem receber tioglicolato.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Depois de descolorir, o cabelo ficou com um fundo alaranjado indesejado. Qual cor neutraliza o laranja?', 'multipla_escolha', '[{"id":"a","texto":"Amarelo"},{"id":"b","texto":"Vermelho"},{"id":"c","texto":"Azul"},{"id":"d","texto":"Laranja"}]'::jsonb, '"c"'::jsonb, 1, 2, 'Na estrela, o oposto do laranja é o azul, que o neutraliza.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'O cabelo ficou amarelado e a cliente quer um loiro mais frio. Qual cor neutraliza o amarelo?', 'multipla_escolha', '[{"id":"a","texto":"Roxo / violeta"},{"id":"b","texto":"Verde"},{"id":"c","texto":"Laranja"},{"id":"d","texto":"Dourado"}]'::jsonb, '"a"'::jsonb, 1, 3, 'O oposto do amarelo na estrela é o roxo (violeta).');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Em uma tinta 8.35, qual é a leitura correta?', 'multipla_escolha', '[{"id":"a","texto":"Loiro claro, reflexo dourado mais aparente e nuance acaju"},{"id":"b","texto":"Castanho, reflexo cinza"},{"id":"c","texto":"Loiro claro, reflexo acaju mais aparente e nuance dourado"},{"id":"d","texto":"8 volumes de OX e 35 minutos de pausa"}]'::jsonb, '"a"'::jsonb, 1, 4, '8 = loiro claro; o primeiro reflexo (.3 dourado) é o mais aparente e o segundo (.5 acaju) é a nuance.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Misturando partes iguais das bases 5, 6 e 8, qual altura de tom aproximada você terá?', 'multipla_escolha', '[{"id":"a","texto":"5"},{"id":"b","texto":"6"},{"id":"c","texto":"7"},{"id":"d","texto":"19"}]'::jsonb, '"b"'::jsonb, 1, 5, '5 + 6 + 8 = 19; 19 ÷ 3 ≈ 6,3, ou seja, aproximadamente 6 (loiro escuro).');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Ao aplicar tioglicolato de amônia, qual distância mínima da raiz deve ser preservada?', 'multipla_escolha', '[{"id":"a","texto":"Nenhuma, aplica-se no couro cabeludo"},{"id":"b","texto":"Pelo menos 1 cm"},{"id":"c","texto":"10 cm"},{"id":"d","texto":"Metade do comprimento"}]'::jsonb, '"b"'::jsonb, 1, 6, 'Preserve pelo menos 1 cm da raiz; o produto nunca deve tocar o couro cabeludo.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Após um alisamento com tioglicolato, quanto tempo a cliente deve esperar para lavar e prender o cabelo?', 'multipla_escolha', '[{"id":"a","texto":"2 horas"},{"id":"b","texto":"24 horas"},{"id":"c","texto":"72 horas"},{"id":"d","texto":"15 dias"}]'::jsonb, '"c"'::jsonb, 1, 7, 'Após o processo, a cliente deve esperar 72 horas para lavar e prender.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual é a função do neutralizante na etapa final do tioglicolato?', 'multipla_escolha', '[{"id":"a","texto":"Dar cor ao cabelo"},{"id":"b","texto":"Restabelecer as pontes de cistina e o pH natural do fio"},{"id":"c","texto":"Abrir as cutículas"},{"id":"d","texto":"Substituir o teste de mecha"}]'::jsonb, '"b"'::jsonb, 1, 8, 'O neutralizante reestrutura as ligações de queratina (pontes de cistina) e restabelece o pH.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual hidróxido NÃO contém lixívia e é muito indicado para cabelos afro?', 'multipla_escolha', '[{"id":"a","texto":"Hidróxido de sódio"},{"id":"b","texto":"Hidróxido de guanidina"},{"id":"c","texto":"Hidróxido de lítio"},{"id":"d","texto":"Hidróxido de amônia"}]'::jsonb, '"b"'::jsonb, 1, 9, 'O hidróxido de guanidina não tem lixívia (soda diluída), mas ainda pode emborrachar e ressecar.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Com a chapinha, o formol vira vapor. Qual estrutura é atingida PRIMEIRO?', 'multipla_escolha', '[{"id":"a","texto":"Os pulmões"},{"id":"b","texto":"Os olhos"},{"id":"c","texto":"As unhas"},{"id":"d","texto":"O estômago"}]'::jsonb, '"b"'::jsonb, 1, 10, 'Os globos oculares são as primeiras estruturas atingidas pelo gás.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual camada do fio é responsável pela elasticidade e pela curvatura do cabelo?', 'multipla_escolha', '[{"id":"a","texto":"Cutícula"},{"id":"b","texto":"Córtex"},{"id":"c","texto":"Medula"},{"id":"d","texto":"Hipoderme"}]'::jsonb, '"b"'::jsonb, 1, 11, 'O córtex embasa solidez, elasticidade e permeabilidade e é responsável pela curvatura.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Por que clarear um cabelo naturalmente claro (rico em feomelanina) pode ser mais demorado?', 'multipla_escolha', '[{"id":"a","texto":"Porque a feomelanina é mais difícil de ser retirada dos fios"},{"id":"b","texto":"Porque a feomelanina é preta"},{"id":"c","texto":"Porque cabelo claro não tem melanina"},{"id":"d","texto":"Porque não pode usar OX"}]'::jsonb, '"a"'::jsonb, 1, 12, 'A feomelanina é fácil de cobrir, mas mais difícil de retirar, por isso o clareamento demora mais.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Até quantos tons o pó descolorante pode clarear, segundo a apostila?', 'multipla_escolha', '[{"id":"a","texto":"1 tom"},{"id":"b","texto":"3 tons"},{"id":"c","texto":"Até 8 tons"},{"id":"d","texto":"Ele não clareia"}]'::jsonb, '"c"'::jsonb, 1, 13, 'Colorações clareiam de 2 a 4 tons; o pó descolorante pode clarear até 8 tons.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual destes é um tom FRIO?', 'multipla_escolha', '[{"id":"a","texto":"Dourado"},{"id":"b","texto":"Acobreado"},{"id":"c","texto":"Acinzentado"},{"id":"d","texto":"Avermelhado"}]'::jsonb, '"c"'::jsonb, 1, 14, 'Frios: tabaco, acinzentado, perolado e platinado. Quentes: dourado, acobreado, chocolate e avermelhado.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Qual é o objetivo de definir metas no marketing do salão?', 'multipla_escolha', '[{"id":"a","texto":"Dar um norte e permitir acompanhar indicadores como vendas e ticket médio"},{"id":"b","texto":"Substituir o atendimento"},{"id":"c","texto":"Gastar mais com anúncios"},{"id":"d","texto":"Não tem objetivo"}]'::jsonb, '"a"'::jsonb, 1, 15, 'Objetivos e metas orientam a estratégia e permitem acompanhar se ela está funcionando.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Sobre as toalhas usadas no atendimento, a regra é:', 'multipla_escolha', '[{"id":"a","texto":"Uma toalha por dia para todas as clientes"},{"id":"b","texto":"Toalhas limpas e individuais para cada cliente"},{"id":"c","texto":"Reutilizar se estiver seca"},{"id":"d","texto":"Toalha não é necessária"}]'::jsonb, '"b"'::jsonb, 1, 16, 'Deve-se usar toalhas limpas e individuais para cada cliente.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Como devem ser os aventais usados em procedimentos químicos?', 'multipla_escolha', '[{"id":"a","texto":"De tecido fino e decorado"},{"id":"b","texto":"Impermeáveis e resistentes"},{"id":"c","texto":"Descartáveis de papel"},{"id":"d","texto":"Não é preciso avental"}]'::jsonb, '"b"'::jsonb, 1, 17, 'Os aventais devem ser impermeáveis e resistentes para proteger de respingos químicos.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Para uma cliente de rosto triangular (queixo proeminente), qual corte valoriza?', 'multipla_escolha', '[{"id":"a","texto":"Franja jogada para o lado, comprida na altura dos olhos"},{"id":"b","texto":"Camadas bagunçadas e desfiadas"},{"id":"c","texto":"Corte pesado e reto no queixo"},{"id":"d","texto":"Raspado nas laterais"}]'::jsonb, '"a"'::jsonb, 1, 18, 'Franja lateral na altura dos olhos e bob mais longo na frente equilibram o rosto triangular.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'Cortar com as mechas a 180° (totalmente para cima) forma:', 'multipla_escolha', '[{"id":"a","texto":"Base reta"},{"id":"b","texto":"Camadas alongadas"},{"id":"c","texto":"Camadas marcadas"},{"id":"d","texto":"Graduação curta na nuca"}]'::jsonb, '"b"'::jsonb, 1, 19, 'A 180°, perpendicular ao chão, formam-se camadas alongadas.');
  INSERT INTO curso_prova_perguntas (prova_id, salao_id, enunciado, tipo, opcoes, resposta_correta, pontuacao, ordem, explicacao)
  VALUES (v_prova_id, v_salao_id, 'A linha de corte VERTICAL forma:', 'multipla_escolha', '[{"id":"a","texto":"Base reta"},{"id":"b","texto":"Camadas marcadas"},{"id":"c","texto":"Somente franja"},{"id":"d","texto":"Corte assimétrico"}]'::jsonb, '"b"'::jsonb, 1, 20, 'Horizontal = base reta; vertical = camadas marcadas; diagonal = graduação e leveza.');

  -- ===== Matricula do aluno de teste, já pronta pra testar no preview =====
  INSERT INTO curso_matriculas (salao_id, aluno_id, curso_id, status, data_matricula, valor_pago, percentual_presenca, certificado_liberado)
  VALUES (v_salao_id, v_aluno_teste_id, v_curso_id, 'andamento', current_date, 0, 100, false)
  RETURNING id INTO v_matricula_id;

  RAISE NOTICE 'Curso importado: % | Matrícula de teste: %', v_curso_id, v_matricula_id;
END $$;

-- =====================================================================
-- Verificação (ÚLTIMA consulta — é a única que o SQL Editor mostra)
-- =====================================================================
SELECT 'curso' AS bloco, c.nome AS detalhe, c.id::text AS id
FROM cursos c WHERE c.nome = 'Hairclass: Cabeleireiro Feminino Profissional'
UNION ALL
SELECT 'modulos', count(*)::text, NULL FROM curso_modulos cm
  JOIN cursos c ON c.id = cm.curso_id WHERE c.nome = 'Hairclass: Cabeleireiro Feminino Profissional'
UNION ALL
SELECT 'aulas', count(*)::text, NULL FROM curso_aulas ca
  JOIN cursos c ON c.id = ca.curso_id WHERE c.nome = 'Hairclass: Cabeleireiro Feminino Profissional'
UNION ALL
SELECT 'provas (quiz+final)', count(*)::text, NULL FROM curso_provas cp
  JOIN cursos c ON c.id = cp.curso_id WHERE c.nome = 'Hairclass: Cabeleireiro Feminino Profissional'
UNION ALL
SELECT 'perguntas', count(*)::text, NULL FROM curso_prova_perguntas cpp
  JOIN curso_provas cp ON cp.id = cpp.prova_id
  JOIN cursos c ON c.id = cp.curso_id WHERE c.nome = 'Hairclass: Cabeleireiro Feminino Profissional'
UNION ALL
SELECT 'matricula aluno teste', ca.nome, cm.id::text
  FROM curso_matriculas cm
  JOIN curso_alunos ca ON ca.id = cm.aluno_id
  JOIN cursos c ON c.id = cm.curso_id
  WHERE c.nome = 'Hairclass: Cabeleireiro Feminino Profissional' AND ca.nome ILIKE 'ZZZ TESTE ALUNO%'
UNION ALL
SELECT 'login do aluno teste', COALESCE(email,'<sem email>'), CASE WHEN auth_user_id IS NULL THEN 'SEM ACESSO CRIADO — crie pela Ficha do Aluno antes de testar' ELSE 'acesso já criado: ' || auth_user_id::text END
  FROM curso_alunos WHERE nome ILIKE 'ZZZ TESTE ALUNO%';
