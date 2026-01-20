import { sanitizeJsonInput } from "../lib/sanitize.js";
import assert from "assert";

const testSanitizeJsonInput = () => {
  console.log("🧪 Testing sanitizeJsonInput function...\n");

  // Test 1: Basic triple-quoted string conversion
  const test1 = () => {
    const input = `{
  "description": """This is a test string with "quotes" and
newlines""",
  "other": "field"
}`;

    const result = sanitizeJsonInput(input);
    const parsed = JSON.parse(result);

    assert(parsed.description.includes("This is a test string"));
    assert(parsed.description.includes('"quotes"'));
    assert(parsed.other === "field");
    console.log("✅ Test 1 passed: Basic triple-quoted string conversion");
  };

  // Test 2: Complex Elasticsearch task with triple quotes
  const test2 = () => {
    const input = `{
  "nodes": {
    "NM-muiceQKeNB9z1Kns4QQ": {
      "tasks": {
        "NM-muiceQKeNB9z1Kns4QQ:340373083": {
          "node": "NM-muiceQKeNB9z1Kns4QQ",
          "id": 340373083,
          "action": "indices:data/write/update/byquery",
          "status": {
            "slice_id": 2,
            "total": 171291,
            "updated": 7000,
            "created": 0,
            "deleted": 0,
            "version_conflicts": 0
          },
          "description": """update-by-query [live-datapoints-catchall] updated with Script{type=inline, lang='painless', idOrCode='
      // Rename getexample.com to example.com on 2025_06_18
      ctx._source.hostname = 'example.com';
      if (ctx._source.referrer != null && ctx._source.referrer.raw != null) {
        ctx._source.referrer.raw = /getexample\\\\.com/.matcher(ctx._source.referrer.raw).replaceAll('example.com');
      }
    ', options={}, params={}}""",
          "start_time_in_millis": 1750248662149,
          "running_time_in_nanos": 22598192660,
          "parent_task_id": "NM-muiceQKeNB9z1Kns4QQ:340372981"
        }
      }
    }
  }
}`;

    const result = sanitizeJsonInput(input);
    const parsed = JSON.parse(result);

    const task =
      parsed.nodes["NM-muiceQKeNB9z1Kns4QQ"].tasks[
        "NM-muiceQKeNB9z1Kns4QQ:340373083"
      ];
    assert(task.description.includes("update-by-query"));
    assert(task.description.includes("example.com"));
    assert(task.status.total === 171291);
    assert(task.status.updated === 7000);

    console.log("✅ Test 2 passed: Complex Elasticsearch task conversion");
  };

  // Test 3: Multiple triple-quoted descriptions
  const test3 = () => {
    const input = `{
  "task1": {
    "description": """First description with "quotes"""
  },
  "task2": {
    "description": """Second description with
    multiple lines and \\ backslashes"""
  }
}`;

    const result = sanitizeJsonInput(input);
    const parsed = JSON.parse(result);

    assert(parsed.task1.description.includes("First description"));
    assert(parsed.task2.description.includes("Second description"));
    assert(parsed.task2.description.includes("\\"));

    console.log("✅ Test 3 passed: Multiple triple-quoted descriptions");
  };

  // Test 4: Edge case - no triple quotes
  const test4 = () => {
    const input = `{
  "normal": "string",
  "number": 123
}`;

    const result = sanitizeJsonInput(input);
    const parsed = JSON.parse(result);

    assert(parsed.normal === "string");
    assert(parsed.number === 123);

    console.log("✅ Test 4 passed: No triple quotes (normal JSON)");
  };

  // Test 5: Comment removal
  const test5 = () => {
    const input = `{
  // This is a comment
  "field": "value", // Another comment
  "description": """Triple quoted with // comment inside"""
}`;

    const result = sanitizeJsonInput(input);
    const parsed = JSON.parse(result);

    assert(parsed.field === "value");
    assert(parsed.description.includes("Triple quoted"));

    console.log("✅ Test 5 passed: Comment removal");
  };

  // Test 6: Update-by-query payload with script source
  const test6 = () => {
    const input = `POST /live-datapoints-catchall,live-datapoints-free/_update_by_query?wait_for_completion=false&conflicts=proceed&refresh=false
{
  "script": {
    "source": """
      // Rename old.example.com to new.example.com on 2026_01_20
      ctx._source.hostname = 'new.example.com';
      if (ctx._source.referrer != null && ctx._source.referrer.raw != null) {
        ctx._source.referrer.raw = /old\\.example\\.com/.matcher(ctx._source.referrer.raw).replaceAll('new.example.com');
      }
      if (ctx._source.referrer != null && ctx._source.referrer.hostname != null && ctx._source.referrer.hostname.raw != null) {
        ctx._source.referrer.hostname.raw = /old\\.example\\.com/.matcher(ctx._source.referrer.hostname.raw).replaceAll('new.example.com');
      }
      if (ctx._source.referrer != null && ctx._source.referrer.hostname != null && ctx._source.referrer.hostname.text != null) {
        ctx._source.referrer.hostname.text = /old\\.example\\.com/.matcher(ctx._source.referrer.hostname.text).replaceAll('new.example.com');
      }
      if (ctx._source.referrer != null && ctx._source.referrer.hostname != null && ctx._source.referrer.hostname.normalized != null) {
        ctx._source.referrer.hostname.normalized = /old\\.example\\.com/.matcher(ctx._source.referrer.hostname.normalized).replaceAll('new.example.com');
      }
      if (ctx._source.hostname_non_robot_pageview == 'old.example.com') {
        ctx._source.hostname_non_robot_pageview = 'new.example.com';
      }
      if (ctx._source.hostname_non_robot_event == 'old.example.com') {
        ctx._source.hostname_non_robot_event = 'new.example.com';
      }
      if (ctx._source.meta != null && ctx._source.meta.notes != null) {
        def notes = new ArrayList();
        notes.add(ctx._source.meta.notes);
        notes.add('manual_rename_2026_01_20');
        ctx._source.meta.notes = notes;
      } else {
        ctx._source.meta.notes = ['manual_rename_2026_01_20'];
      }
    """,
    "lang": "painless"
  },
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "hostname": {
              "value": "old.example.com"
            }
          }
        }
      ]
    }
  },
  "sort": [
    {
      "@timestamp": {
        "order": "desc"
      }
    }
  ]
}`;

    const result = sanitizeJsonInput(input);
    const parsed = JSON.parse(result);

    assert(parsed.script.lang === "painless");
    assert(parsed.script.source.includes("new.example.com"));
    assert(parsed.query.bool.must[0].term.hostname.value === "old.example.com");

    console.log("✅ Test 6 passed: Update-by-query payload with script source");
  };

  // Run all tests
  try {
    test1();
    test2();
    test3();
    test4();
    test5();
    test6();

    console.log("\n🎉 All sanitizeJsonInput tests passed!");
    return true;
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error.stack);
    return false;
  }
};

export { testSanitizeJsonInput };
